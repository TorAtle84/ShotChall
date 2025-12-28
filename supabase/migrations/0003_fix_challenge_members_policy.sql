-- Fix recursive RLS policy on challenge_members

drop policy if exists challenge_members_select_members on challenge_members;

create policy challenge_members_select_members
on challenge_members for select
using (
  is_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from challenges c
    where c.id = challenge_id and c.challenger_id = auth.uid()
  )
);
