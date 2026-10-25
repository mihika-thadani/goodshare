-- Goodshare database setup.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: it only creates what is missing and replaces the policies.

-- Profiles: one per signed-up user, created automatically on sign-up
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Neighbor',
  bio text not null default '',
  location text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Neighbor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Listings shared by members (the built-in sample listings live in the site code)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lender_name text not null,
  name text not null,
  category text not null,
  occasion text not null default 'Get Things Done',
  price numeric not null default 0,
  sharing_option text not null default 'free',
  brand text not null default '',
  color text not null default '',
  guarantee numeric not null default 0,
  neighborhood text not null,
  lat double precision,
  lng double precision,
  image_url text not null default '',
  description text not null default '',
  condition text not null default '',
  accessories text not null default '',
  care text not null default '',
  care_instructions text[] not null default '{}',
  custom_care text not null default '',
  availability text not null default 'Available by request',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Borrow requests. listing_id is text so sample listings ("pickle") work too.
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  owner_id uuid references auth.users (id) on delete cascade,
  borrower_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  borrower_name text not null default 'Neighbor',
  start_date date not null,
  end_date date not null,
  days integer not null,
  status text not null default 'Pending approval'
    check (status in ('Pending approval', 'Upcoming', 'Active', 'Completed', 'Declined')),
  created_at timestamptz not null default now()
);

-- "Can anyone lend me…?" posts from the Community page
create table if not exists public.community_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item text not null,
  neighborhood text not null default '',
  status text not null default 'Open' check (status in ('Open', 'Fulfilled', 'Closed')),
  responses integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.requests enable row level security;
alter table public.community_requests enable row level security;

-- Profiles: names are public, only you can edit yours
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select using (true);
drop policy if exists "edit own profile" on public.profiles;
create policy "edit own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Listings: everyone can browse, only the owner can change or remove
drop policy if exists "listings readable" on public.listings;
create policy "listings readable" on public.listings for select using (true);
drop policy if exists "create own listing" on public.listings;
create policy "create own listing" on public.listings for insert
  to authenticated with check (auth.uid() = owner_id);
drop policy if exists "edit own listing" on public.listings;
create policy "edit own listing" on public.listings for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "delete own listing" on public.listings;
create policy "delete own listing" on public.listings for delete
  using (auth.uid() = owner_id);

-- Requests: only the borrower and the lender see or update them
drop policy if exists "see own requests" on public.requests;
create policy "see own requests" on public.requests for select
  using (auth.uid() = borrower_id or auth.uid() = owner_id);
drop policy if exists "create request as borrower" on public.requests;
create policy "create request as borrower" on public.requests for insert
  to authenticated with check (
    auth.uid() = borrower_id
    and (owner_id is null or owner_id <> auth.uid())
  );
drop policy if exists "update own requests" on public.requests;
create policy "update own requests" on public.requests for update
  using (auth.uid() = borrower_id or auth.uid() = owner_id);

-- Requests always point at the real lender, and each side can only make its own moves:
-- the lender approves or declines; either side marks pickup and return.
create or replace function public.guard_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    select owner_id into new.owner_id from public.listings where id::text = new.listing_id;
    if new.owner_id = auth.uid() then
      raise exception 'You cannot borrow your own listing';
    end if;
    new.status := 'Pending approval';
    return new;
  end if;
  if new.listing_id <> old.listing_id or new.borrower_id <> old.borrower_id
     or new.owner_id is distinct from old.owner_id then
    raise exception 'Only the request status can change';
  end if;
  if new.status = old.status then
    return new;
  end if;
  if (old.status = 'Pending approval' and new.status in ('Upcoming', 'Declined')
        and auth.uid() = old.owner_id)
     or (old.status = 'Upcoming' and new.status = 'Active')
     or (old.status = 'Active' and new.status = 'Completed') then
    return new;
  end if;
  raise exception 'Request cannot move from % to %', old.status, new.status;
end;
$$;

drop trigger if exists guard_request on public.requests;
create trigger guard_request
  before insert or update on public.requests
  for each row execute function public.guard_request();

-- Community requests: readable by all, managed by their author
drop policy if exists "community readable" on public.community_requests;
create policy "community readable" on public.community_requests for select using (true);
drop policy if exists "create own community request" on public.community_requests;
create policy "create own community request" on public.community_requests for insert
  to authenticated with check (auth.uid() = owner_id);
drop policy if exists "edit own community request" on public.community_requests;
create policy "edit own community request" on public.community_requests for update
  using (auth.uid() = owner_id);

-- Listing photos: public to view, each user uploads into their own folder
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "upload own photos" on storage.objects;
create policy "upload own photos" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "replace own photos" on storage.objects;
create policy "replace own photos" on storage.objects for update
  to authenticated using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
