# Decisions

## 2025-12-26
- Use the existing Supabase project for v1 (ref: ubhdzzifbmwuoijcnfrl) and plan a new project later if needed.
- Keep the web app in `apps/web` with Next.js App Router + Tailwind.
- Store public profile data in `profiles` and sensitive fields in `profile_private` with RLS.

## 2025-12-27
- Use explicit `/auth/*` routes (via `app/auth`) to match links/middleware consistently.
- Process Supabase email verification links on `/auth/verify` by exchanging `code`/`token_hash` in a client helper to avoid server cookie mutations.
- Add admin-only report update/delete policies in a follow-up migration.
- Exempt the cleanup cron endpoint from auth middleware redirects.
- Allow Vercel Cron GET requests (user-agent `vercel-cron/*`) for the cleanup job and define the schedule in `apps/web/vercel.json`.
- Send moderation emails via Resend using `RESEND_API_KEY` and `EMAIL_FROM` env vars.
- Compute Milestone 5 leaderboards and stats server-side (service role) and derive streaks from `challenges.daily_date`.
