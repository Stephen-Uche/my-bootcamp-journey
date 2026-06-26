-- Anonymous listing likes are tracked per browser visitor cookie.
-- The table has RLS enabled and is intended to be written through Next.js API
-- routes that use SUPABASE_SERVICE_ROLE_KEY, not directly from the browser.

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
