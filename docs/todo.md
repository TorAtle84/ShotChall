# Next Actions

- Apply `supabase/migrations/0001_init.sql` to the Supabase project and run the seed scripts.
- Add Vercel env vars for Supabase URL + anon key + service role key + CRON_SECRET.
- Wire up the cleanup cron for unverified accounts with the `api/cron/cleanup-unverified` route.
- Build Milestone 2 (profiles + friends) after auth flow is validated.
