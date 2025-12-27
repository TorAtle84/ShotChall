# Decisions

## 2025-12-26
- Use the existing Supabase project for v1 (ref: ubhdzzifbmwuoijcnfrl) and plan a new project later if needed.
- Keep the web app in `apps/web` with Next.js App Router + Tailwind.
- Store public profile data in `profiles` and sensitive fields in `profile_private` with RLS.
