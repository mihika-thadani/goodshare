-- Goodshare update 2: messages between borrower and lender, live updates,
-- and an email to the lender when someone requests their item.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to re-run.
-- Then run supabase/brevo-secrets.sql (with your own Brevo key) to turn on emails.

-- Messages are always tied to one borrow request, between its borrower and lender
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipient_id uuid references auth.users (id) on delete cascade,
  sender_name text not null default 'Neighbor',
  body text not null check (char_length(trim(body)) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "see own messages" on public.messages;
create policy "see own messages" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "send messages" on public.messages;
create policy "send messages" on public.messages for insert
  to authenticated with check (auth.uid() = sender_id);
drop policy if exists "mark messages read" on public.messages;
create policy "mark messages read" on public.messages for update
  using (auth.uid() = recipient_id);

-- The recipient is always the other person on the request; only read_at may change later
create or replace function public.guard_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  req public.requests;
begin
  if tg_op = 'UPDATE' then
    if new.body <> old.body or new.sender_id <> old.sender_id
       or new.recipient_id is distinct from old.recipient_id
       or new.request_id <> old.request_id then
      raise exception 'Messages cannot be edited';
    end if;
    return new;
  end if;
  select * into req from public.requests where id = new.request_id;
  if req.id is null or req.owner_id is null then
    raise exception 'This request has no neighbor to message';
  end if;
  if auth.uid() = req.borrower_id then
    new.recipient_id := req.owner_id;
  elsif auth.uid() = req.owner_id then
    new.recipient_id := req.borrower_id;
  else
    raise exception 'You are not part of this request';
  end if;
  new.sender_id := auth.uid();
  select display_name into new.sender_name from public.profiles where id = auth.uid();
  new.sender_name := coalesce(new.sender_name, 'Neighbor');
  new.read_at := null;
  return new;
end;
$$;

drop trigger if exists guard_message on public.messages;
create trigger guard_message
  before insert or update on public.messages
  for each row execute function public.guard_message();

-- Live updates: the site refreshes requests and messages as they change
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'requests') then
    alter publication supabase_realtime add table public.requests;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;

-- Email the lender through Brevo when a new borrow request arrives.
-- Uses pg_net for the HTTP call and Vault for the API key (see brevo-secrets.sql).
create extension if not exists pg_net;

create or replace function public.email_lender_on_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  api_key text;
  sender_email text;
  lender_email text;
  lender_name text;
  item_name text;
  link text := 'https://mihika-thadani.github.io/goodshare/?request=' || new.id;
  safe_item text;
  safe_borrower text;
begin
  if new.owner_id is null then
    return new;
  end if;
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'brevo_api_key';
  select decrypted_secret into sender_email from vault.decrypted_secrets where name = 'brevo_sender_email';
  if api_key is null or sender_email is null then
    return new; -- emails not configured yet
  end if;
  select email into lender_email from auth.users where id = new.owner_id;
  select display_name into lender_name from public.profiles where id = new.owner_id;
  select name into item_name from public.listings where id::text = new.listing_id;
  safe_item := replace(replace(replace(coalesce(item_name, 'your item'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  safe_borrower := replace(replace(replace(new.borrower_name, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');

  perform net.http_post(
    url := 'https://api.brevo.com/v3/smtp/email',
    headers := jsonb_build_object(
      'api-key', api_key,
      'Content-Type', 'application/json',
      'Accept', 'application/json'
    ),
    body := jsonb_build_object(
      'sender', jsonb_build_object('name', 'Goodshare', 'email', sender_email),
      'to', jsonb_build_array(jsonb_build_object('email', lender_email, 'name', coalesce(lender_name, 'Neighbor'))),
      'subject', new.borrower_name || ' wants to borrow your ' || coalesce(item_name, 'item'),
      'htmlContent',
        '<div style="font-family:Arial,sans-serif;color:#243654;max-width:520px">'
        || '<h2 style="color:#4F7F62">New borrow request</h2>'
        || '<p><b>' || safe_borrower || '</b> would like to borrow your <b>' || safe_item || '</b>'
        || ' from ' || to_char(new.start_date, 'Mon DD') || ' to ' || to_char(new.end_date, 'Mon DD, YYYY') || '.</p>'
        || '<p><a href="' || link || '" style="display:inline-block;background:#4F7F62;color:#fff;'
        || 'padding:12px 20px;border-radius:10px;text-decoration:none">Review request</a></p>'
        || '<p style="color:#5a6a82;font-size:13px">Approve or decline it on Goodshare.</p></div>'
    )
  );
  return new;
exception when others then
  return new; -- never block a request because an email failed
end;
$$;

drop trigger if exists email_lender_on_request on public.requests;
create trigger email_lender_on_request
  after insert on public.requests
  for each row execute function public.email_lender_on_request();
