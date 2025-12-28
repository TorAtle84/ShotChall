# Next Actions

- Set Vercel env vars for Supabase URL + anon key + service role key + CRON_SECRET.
- Configure moderation env vars: `ADMIN_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM`, `SUPABASE_SUBMISSIONS_BUCKET`.
- Configure the Vercel cron (GET) via `apps/web/vercel.json` for `/api/cron/cleanup-unverified`.
- Promote at least one admin account by setting `profile_private.is_admin = true`.
- Validate auth flow end-to-end (signup -> verify link -> login).
