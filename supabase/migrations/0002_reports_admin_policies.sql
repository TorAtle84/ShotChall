-- Allow admins to manage report lifecycle states.

create policy reports_update_admin
on reports for update
using (is_admin())
with check (is_admin());

create policy reports_delete_admin
on reports for delete
using (is_admin());
