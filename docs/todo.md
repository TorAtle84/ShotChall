# Next Actions

- Apply `supabase/migrations/0002_reports_admin_policies.sql` to the Supabase project.
- Set Vercel env vars for Supabase URL + anon key + service role key + CRON_SECRET.
- Configure a cron job to call `api/cron/cleanup-unverified` with the CRON_SECRET header.
- Validate auth flow end-to-end (signup -> verify link -> login).
