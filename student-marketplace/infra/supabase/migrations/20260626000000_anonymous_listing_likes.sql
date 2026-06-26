-- Anonymous listing likes are tracked per browser visitor cookie.
-- The table has RLS enabled so visitors can only write rows for their own
-- visitor id and only for available listings.

create table if not exists public.listing_likes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  visitor_id text not null check (char_length(visitor_id) between 16 and 128),
  created_at timestamptz not null default now(),
  unique (listing_id, visitor_id)
);

create index if not exists listing_likes_listing_id_idx
on public.listing_likes (listing_id);

alter table public.listing_likes enable row level security;

drop policy if exists "Listing likes readable by everyone" on public.listing_likes;
create policy "Listing likes readable by everyone"
on public.listing_likes
for select
to anon, authenticated
using (true);

drop policy if exists "Visitors can like available listings" on public.listing_likes;
create policy "Visitors can like available listings"
on public.listing_likes
for insert
to anon, authenticated
with check (
  visitor_id = coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-visitor-id', '')
  and exists (
    select 1
    from public.listings
    where listings.id = listing_likes.listing_id
      and listings.status = 'available'
  )
);

drop policy if exists "Visitors can remove own listing likes" on public.listing_likes;
create policy "Visitors can remove own listing likes"
on public.listing_likes
for delete
to anon, authenticated
using (
  visitor_id = coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-visitor-id', '')
);
