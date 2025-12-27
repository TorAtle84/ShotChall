# Next Actions

- Apply `supabase/migrations/0002_reports_admin_policies.sql` to the Supabase project.
- Set Vercel env vars for Supabase URL + anon key + service role key + CRON_SECRET.
- Configure the Vercel cron (GET) via `apps/web/vercel.json` for `/api/cron/cleanup-unverified`.
- Validate auth flow end-to-end (signup -> verify link -> login).
