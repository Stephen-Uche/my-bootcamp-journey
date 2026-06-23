-- Student Marketplace initial Supabase schema.
-- Run this in Supabase SQL Editor or with `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  university text,
  verified_student boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
using (id = auth.uid());

drop policy if exists "Profiles insertable by own user" on public.profiles;
create policy "Profiles insertable by own user"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Profiles updatable by owner" on public.profiles;
create policy "Profiles updatable by owner"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

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
using (seller_id = auth.uid());

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
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

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
