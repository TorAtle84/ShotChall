-- ShotChall initial schema and RLS

create extension if not exists "pgcrypto";

create type challenge_visibility as enum ('private','public');
create type challenge_status as enum ('draft','active','ended','cancelled');
create type challenge_type as enum ('text','photo');
create type member_role as enum ('challenger','participant');
create type member_status as enum ('invited','accepted','declined','submitted','expired');
create type report_reason as enum ('nudity','violence','harassment','spam','other');
create type report_status as enum ('open','actioned','dismissed');
create type report_action_type as enum ('warn','delete');
create type reaction_type as enum ('flame','heart','wow');
create type suggestion_status as enum ('pending','approved','rejected');
create type friendship_status as enum ('pending','accepted','declined');
create type notification_type as enum ('challenge_received','challenge_ended');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null,
  display_name text,
  avatar_url text,
  is_public boolean not null default false,
  is_public_challenger boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(username) >= 3)
);
create unique index profiles_username_lower_idx on profiles (lower(username));

create table profile_private (
  user_id uuid primary key references profiles(id) on delete cascade,
  country text not null,
  city text not null,
  timezone text not null,
  quiet_hours_start time not null default '22:00',
  quiet_hours_end time not null default '06:00',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
create unique index friendships_pair_idx on friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);

create table challenge_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table challenge_templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references challenge_categories(id),
  text text not null,
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table challenge_template_suggestions (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category_id uuid references challenge_categories(id),
  created_by uuid not null references profiles(id) on delete cascade,
  status suggestion_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  approved_template_id uuid references challenge_templates(id),
  created_at timestamptz not null default now()
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references profiles(id) on delete cascade,
  type challenge_type not null,
  template_id uuid references challenge_templates(id),
  prompt_text text,
  reference_image_path text,
  transform_mode text,
  rules_note text,
  visibility challenge_visibility not null,
  status challenge_status not null default 'draft',
  base_time_limit_hours smallint not null check (base_time_limit_hours between 6 and 48),
  extension_hours smallint not null default 0,
  start_at timestamptz,
  end_at timestamptz,
  community_vote_enabled boolean not null default false,
  is_daily boolean not null default false,
  daily_date date,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index challenges_visibility_status_idx on challenges (visibility, status);
create index challenges_challenger_idx on challenges (challenger_id);

create table challenge_members (
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role member_role not null,
  status member_status not null default 'invited',
  public_consent boolean not null default false,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);
create index challenge_members_user_idx on challenge_members (user_id);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  image_path text not null,
  image_thumb_path text not null,
  image_meta jsonb,
  created_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);
create index submissions_challenge_idx on submissions (challenge_id);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  rater_id uuid not null references profiles(id) on delete cascade,
  stars smallint not null check (stars between 0 and 5),
  created_at timestamptz not null default now(),
  unique (submission_id, rater_id)
);
create index ratings_submission_idx on ratings (submission_id);

create table reactions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  reaction reaction_type not null,
  created_at timestamptz not null default now(),
  unique (submission_id, user_id, reaction)
);
create index reactions_submission_idx on reactions (submission_id);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_user_id uuid not null references profiles(id) on delete cascade,
  submission_id uuid references submissions(id) on delete set null,
  challenge_id uuid references challenges(id) on delete set null,
  reason report_reason not null,
  details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);
create index reports_reported_user_idx on reports (reported_user_id);
create index reports_submission_idx on reports (submission_id);

create table report_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  admin_id uuid not null references profiles(id) on delete cascade,
  action report_action_type not null,
  action_notes text,
  created_at timestamptz not null default now()
);

create table user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  payload jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_user_idx on notifications (user_id, created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), new.raw_user_meta_data->>'username')
  );

  insert into public.profile_private (user_id, country, city, timezone)
  values (
    new.id,
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'timezone'
  );

  return new;
end;
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profile_private pp
    where pp.user_id = auth.uid() and pp.is_admin = true
  );
$$;

create or replace function can_submit(_challenge_id uuid, _user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from challenge_members cm
    where cm.challenge_id = _challenge_id
      and cm.user_id = _user_id
      and cm.role = 'participant'
      and cm.status = 'accepted'
  );
$$;

create or replace function enforce_rating_rules()
returns trigger
language plpgsql
as $$
declare
  v_visibility challenge_visibility;
begin
  select c.visibility into v_visibility
  from submissions s
  join challenges c on c.id = s.challenge_id
  where s.id = new.submission_id;

  if v_visibility = 'public' and (new.stars < 1 or new.stars > 5) then
    raise exception 'Public rating must be 1-5';
  end if;

  if v_visibility = 'private' and (new.stars < 0 or new.stars > 5) then
    raise exception 'Private rating must be 0-5';
  end if;

  return new;
end;
$$;

create or replace function enforce_block_requires_report()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from reports r
    where r.reporter_id = new.blocker_id
      and r.reported_user_id = new.blocked_id
      and r.submission_id is not null
  ) then
    raise exception 'Block requires a prior picture report';
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on profiles
for each row execute procedure set_updated_at();

create trigger profile_private_set_updated_at
before update on profile_private
for each row execute procedure set_updated_at();

create trigger friendships_set_updated_at
before update on friendships
for each row execute procedure set_updated_at();

create trigger challenges_set_updated_at
before update on challenges
for each row execute procedure set_updated_at();

create trigger challenge_members_set_updated_at
before update on challenge_members
for each row execute procedure set_updated_at();

create trigger ratings_enforce_rules
before insert or update on ratings
for each row execute procedure enforce_rating_rules();

create trigger user_blocks_enforce_report
before insert on user_blocks
for each row execute procedure enforce_block_requires_report();

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
alter table profile_private enable row level security;
alter table friendships enable row level security;
alter table challenge_categories enable row level security;
alter table challenge_templates enable row level security;
alter table challenge_template_suggestions enable row level security;
alter table challenges enable row level security;
alter table challenge_members enable row level security;
alter table submissions enable row level security;
alter table ratings enable row level security;
alter table reactions enable row level security;
alter table reports enable row level security;
alter table report_actions enable row level security;
alter table user_blocks enable row level security;
alter table notifications enable row level security;

create policy profiles_select_public
on profiles for select
using (true);

create policy profiles_insert_own
on profiles for insert
with check (id = auth.uid());

create policy profiles_update_own
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy profile_private_select_own
on profile_private for select
using (user_id = auth.uid() or is_admin());

create policy profile_private_insert_own
on profile_private for insert
with check (user_id = auth.uid());

create policy profile_private_update_own
on profile_private for update
using (user_id = auth.uid() or is_admin())
with check (user_id = auth.uid() or is_admin());

create policy friendships_select_participants
on friendships for select
using (requester_id = auth.uid() or addressee_id = auth.uid() or is_admin());

create policy friendships_insert_requester
on friendships for insert
with check (requester_id = auth.uid());

create policy friendships_update_participants
on friendships for update
using (requester_id = auth.uid() or addressee_id = auth.uid() or is_admin())
with check (requester_id = auth.uid() or addressee_id = auth.uid() or is_admin());

create policy challenge_categories_select_public
on challenge_categories for select
using (true);

create policy challenge_categories_admin_write
on challenge_categories for all
using (is_admin())
with check (is_admin());

create policy challenge_templates_select_public
on challenge_templates for select
using (true);

create policy challenge_templates_admin_write
on challenge_templates for all
using (is_admin())
with check (is_admin());

create policy suggestions_select_owner_or_admin
on challenge_template_suggestions for select
using (created_by = auth.uid() or is_admin());

create policy suggestions_insert_owner
on challenge_template_suggestions for insert
with check (created_by = auth.uid());

create policy suggestions_admin_update
on challenge_template_suggestions for update
using (is_admin())
with check (is_admin());

create policy challenges_select_public_or_member
on challenges for select
using (
  is_admin()
  or challenger_id = auth.uid()
  or exists (
    select 1 from challenge_members cm
    where cm.challenge_id = id and cm.user_id = auth.uid()
  )
  or (visibility = 'public' and status <> 'draft')
);

create policy challenges_insert_challenger
on challenges for insert
with check (challenger_id = auth.uid());

create policy challenges_update_challenger
on challenges for update
using (challenger_id = auth.uid() or is_admin())
with check (challenger_id = auth.uid() or is_admin());

create policy challenges_delete_challenger
on challenges for delete
using (challenger_id = auth.uid() or is_admin());

create policy challenge_members_select_members
on challenge_members for select
using (
  is_admin()
  or exists (
    select 1 from challenge_members cm
    where cm.challenge_id = challenge_id and cm.user_id = auth.uid()
  )
);

create policy challenge_members_insert_challenger_or_self
on challenge_members for insert
with check (
  is_admin()
  or exists (
    select 1 from challenges c
    where c.id = challenge_id and c.challenger_id = auth.uid()
  )
  or (
    user_id = auth.uid()
    and exists (
      select 1 from challenges c
      where c.id = challenge_id and c.visibility = 'public' and c.status = 'active'
    )
  )
);

create policy challenge_members_update_self_or_challenger
on challenge_members for update
using (
  is_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from challenges c
    where c.id = challenge_id and c.challenger_id = auth.uid()
  )
)
with check (
  is_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from challenges c
    where c.id = challenge_id and c.challenger_id = auth.uid()
  )
);

create policy submissions_select_public_or_member
on submissions for select
using (
  is_admin()
  or exists (
    select 1 from challenges c
    where c.id = challenge_id and c.visibility = 'public' and c.status <> 'draft'
  )
  or exists (
    select 1 from challenge_members cm
    where cm.challenge_id = challenge_id and cm.user_id = auth.uid()
  )
);

create policy submissions_insert_owner
on submissions for insert
with check (user_id = auth.uid() and can_submit(challenge_id, auth.uid()));

create policy submissions_update_owner
on submissions for update
using (user_id = auth.uid() or is_admin())
with check (user_id = auth.uid() or is_admin());

create policy submissions_delete_owner
on submissions for delete
using (user_id = auth.uid() or is_admin());

create policy ratings_select_public_or_member
on ratings for select
using (
  is_admin()
  or exists (
    select 1 from submissions s
    join challenges c on c.id = s.challenge_id
    where s.id = submission_id
      and c.visibility = 'public'
      and c.status <> 'draft'
  )
  or exists (
    select 1 from submissions s
    join challenge_members cm on cm.challenge_id = s.challenge_id
    where s.id = submission_id and cm.user_id = auth.uid()
  )
);

create policy ratings_insert_rater
on ratings for insert
with check (
  rater_id = auth.uid()
  and (
    exists (
      select 1 from submissions s
      join challenges c on c.id = s.challenge_id
      where s.id = submission_id
        and c.visibility = 'public'
        and c.status <> 'draft'
    )
    or exists (
      select 1 from submissions s
      join challenge_members cm on cm.challenge_id = s.challenge_id
      where s.id = submission_id and cm.user_id = auth.uid()
    )
  )
);

create policy ratings_delete_rater
on ratings for delete
using (rater_id = auth.uid() or is_admin());

create policy reactions_select_public_or_member
on reactions for select
using (
  is_admin()
  or exists (
    select 1 from submissions s
    join challenges c on c.id = s.challenge_id
    where s.id = submission_id
      and c.visibility = 'public'
      and c.status <> 'draft'
  )
  or exists (
    select 1 from submissions s
    join challenge_members cm on cm.challenge_id = s.challenge_id
    where s.id = submission_id and cm.user_id = auth.uid()
  )
);

create policy reactions_insert_user
on reactions for insert
with check (
  user_id = auth.uid()
  and (
    exists (
      select 1 from submissions s
      join challenges c on c.id = s.challenge_id
      where s.id = submission_id
        and c.visibility = 'public'
        and c.status <> 'draft'
    )
    or exists (
      select 1 from submissions s
      join challenge_members cm on cm.challenge_id = s.challenge_id
      where s.id = submission_id and cm.user_id = auth.uid()
    )
  )
);

create policy reactions_delete_user
on reactions for delete
using (user_id = auth.uid() or is_admin());

create policy reports_select_owner_or_admin
on reports for select
using (reporter_id = auth.uid() or is_admin());

create policy reports_insert_owner
on reports for insert
with check (reporter_id = auth.uid());

create policy report_actions_admin_all
on report_actions for all
using (is_admin())
with check (is_admin());

create policy user_blocks_select_owner
on user_blocks for select
using (blocker_id = auth.uid() or is_admin());

create policy user_blocks_insert_owner
on user_blocks for insert
with check (blocker_id = auth.uid());

create policy user_blocks_delete_owner
on user_blocks for delete
using (blocker_id = auth.uid() or is_admin());

create policy notifications_select_owner
on notifications for select
using (user_id = auth.uid() or is_admin());

create policy notifications_update_owner
on notifications for update
using (user_id = auth.uid() or is_admin())
with check (user_id = auth.uid() or is_admin());

