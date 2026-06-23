-- Student Marketplace initial Supabase schema.
-- Run this in Supabase SQL Editor or with `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  university text,
  verified_student boolean not null default false,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists role text not null default 'student';

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check check (role in ('student', 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    university,
    verified_student,
    role
  )
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'university', ''), split_part(new.email, '@', 2)),
    case
      when new.raw_user_meta_data ->> 'verified_student' in ('true', 'false')
        then (new.raw_user_meta_data ->> 'verified_student')::boolean
      else false
    end,
    'student'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    university = coalesce(excluded.university, public.profiles.university),
    verified_student = public.profiles.verified_student or excluded.verified_student;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (
  id,
  email,
  full_name,
  university,
  verified_student,
  role
)
select
  auth_user.id,
  auth_user.email,
  nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'university', ''), split_part(auth_user.email, '@', 2)),
  case
    when auth_user.raw_user_meta_data ->> 'verified_student' in ('true', 'false')
      then (auth_user.raw_user_meta_data ->> 'verified_student')::boolean
    else false
  end,
  'student'
from auth.users as auth_user
where auth_user.email is not null
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  university = coalesce(excluded.university, public.profiles.university),
  verified_student = public.profiles.verified_student or excluded.verified_student;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

create or replace function public.prevent_profile_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and auth.uid() is not null and not public.is_admin(auth.uid()) then
    raise exception 'Only admins can change profile roles.';
  end if;

  return new;
end;
$$;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  category text not null,
  price numeric(10, 2) not null check (price > 0),
  condition text not null check (condition in ('new', 'like-new', 'good', 'fair')),
  status text not null default 'available' check (status in ('available', 'sold', 'removed')),
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_prevent_role_self_escalation on public.profiles;
create trigger profiles_prevent_role_self_escalation
before update on public.profiles
for each row
execute function public.prevent_profile_role_self_escalation();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

create index if not exists listings_available_created_at_idx
on public.listings (created_at desc)
where status = 'available';

create index if not exists listings_seller_created_at_idx
on public.listings (seller_id, created_at desc);

create index if not exists listings_category_idx
on public.listings (category)
where status = 'available';

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

drop policy if exists "Profiles readable by owner" on public.profiles;
create policy "Profiles readable by owner"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Profiles updatable by owner" on public.profiles;
create policy "Profiles updatable by owner"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Profiles updatable by admins" on public.profiles;
create policy "Profiles updatable by admins"
on public.profiles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Available listings readable by everyone" on public.listings;
create policy "Available listings readable by everyone"
on public.listings
for select
to anon, authenticated
using (status = 'available');

drop policy if exists "Sellers can read own listings" on public.listings;
create policy "Sellers can read own listings"
on public.listings
for select
to authenticated
using (seller_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Sellers can create own listings" on public.listings;
create policy "Sellers can create own listings"
on public.listings
for insert
to authenticated
with check (seller_id = auth.uid());

drop policy if exists "Sellers can update own listings" on public.listings;
create policy "Sellers can update own listings"
on public.listings
for update
to authenticated
using (seller_id = auth.uid() or public.is_admin(auth.uid()))
with check (seller_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Sellers can delete own listings" on public.listings;
create policy "Sellers can delete own listings"
on public.listings
for delete
to authenticated
using (seller_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Listing images readable by everyone" on storage.objects;
create policy "Listing images readable by everyone"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'listing-images');

drop policy if exists "Users can upload listing images to own folder" on storage.objects;
create policy "Users can upload listing images to own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update listing images in own folder" on storage.objects;
create policy "Users can update listing images in own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete listing images in own folder" on storage.objects;
create policy "Users can delete listing images in own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
