# PROJECT: ShotChall (Photo Challenge App) â€” Next.js + Supabase + Vercel

You are Codex CLI acting as a senior full-stack engineer + product-minded architect.
Everything must be in ENGLISH (UI text, code comments, docs).
Build a family-friendly, intuitive, slightly urban/fashion-feeling web app first. Mobile UX later.

## 0) Non-negotiables
- Next.js (App Router), TypeScript, Tailwind CSS.
- Supabase for Auth + Postgres + Storage + Edge Functions (if needed).
- Deploy to Vercel.
- Robustness, clear UX, safe moderation, strong RLS policies.
- Use a single repo with `/apps/web` (or root web app) and keep code clean and modular.
- Keep state minimal. Prefer server actions / route handlers where sensible.
- All challenges are photo-based submissions (1 photo per participant).
- Images max 25 MB upload; convert/optimize to reduce space (keep â€œgood feelingâ€ quality).
- Storage access via **secure signed URLs**.
- Quiet hours for notifications: **22:00â€“06:00 local user time**.

## 1) Core product concept
ShotChall lets users challenge friends (private) or the public (public arena) to take a photo that matches a â€œchallengeâ€.
The challenger defines the challenge (from templates or custom), sets time limit (6hâ€“48h), selects recipients, and sends.

Participants submit a photo.
Ratings:
- Private friend challenges: challenger rates each photo with stars 0â€“5 (0 allowed only in private).
- Public challenges: stars are 1â€“5 (no 0), and many users can rate.
Winner:
- Always exactly 1 winner (ties allowed in score, but winner is decided by rules).
- Tie-breakers: avgStars first; if still tied, fastest submission wins.

Scoreboards:
- Friends-only scoreboard (wins) sortable by week/month/year.
- Public scoreboard: challenges ranked by â€œmost photos returned + highest scoresâ€.
- â€œTop Challengersâ€ global ranking: users with high average ratings across challenges (not based on wins).

Reactions:
- Fast reactions: â¤ï¸ Flame ðŸ”¥ WOW ðŸ˜® (3 quick reactions to submissions).
- Reaction counts must overlay on the image with heart, fire, and wow icons plus totals.

## 2) Accounts, verification, and access rules
- Registration requires: email, username, password, country, city.
- Password rules: min 8 chars, 1 uppercase, 1 special char.
- Must accept Terms (13+).
- Email verification is mandatory:
  - User cannot login before verified.
  - App checks daily; if not verified within 24 hours, delete the account automatically.
  - Email can be reused after deletion.
- Searchability:
  - Users can always be found publicly (by username only in UI).
  - Their content/profile visibility depends on private/public mode.
- Friend system:
  - Must be â€œaccepted friendsâ€ (both accept) to send private challenges.
  - Users can set themselves **Public Challenger**: then anyone can send them public challenges.
  - Provide a shareable link â€œCome challenge meâ€¦â€ for public challengers.

## 3) Public vs Private content rules
- Default profile is private.
- Public challenges appear on a userâ€™s profile ONLY if the user is public.
- Private challenges never appear publicly.
- If a challenger creates a public challenge that includes specific people, each invited person must consent to participate in a public challenge before joining.

## 4) Challenge types & creation flow (UX)
Bottom nav with a big center camera button.
Creation flow when tapping camera:
1) Choose Challenge type:
   - Text Challenge (template from DB OR free text)
   - â€œMake your own challengeâ€ (photo imitation):
     - Challenger uploads a reference image (not text).
     - Must choose a transform mode: copy / reverse / opposite / etc.
     - Show tooltips explaining modes (e.g., reverse = do same idea reversed).
2) Add short â€œRulesâ€ note (small field).
3) Pick time limit with wheel: min 6 hours, max 48 hours.
4) Pick recipients:
   - Friends (multi-select, max 10 accepted friends per challenge)
   - Or Public challenge (arena)
5) Confirm and send.

One challenge can be sent to multiple friends; only 1 winner, but everyone receives their star rating in their stats.

If user receives a challenge from a friend and submits:
- After submitting, show a dialog: â€œChallenge back?â€ to create a new challenge quickly.

## 5) Voting, rating, and community vote
Private friend challenge:
- By default: challenger rates each submission with 0â€“5.
- If multiple participants and more friends join later, challenger can enable â€œCommunity Voteâ€:
  - Eligible voters: participants only.
  - Each participant + challenger gets 1 vote per submission.
  - If user does not vote before end, vote is forfeited.
  - Stars still matter (avgStars), votes can be additional signal if needed (design carefully).

Public challenge:
- Anyone can rate submissions 1â€“5.
- Many users can rate, plus fast reactions.
- Winner determination: avgStars (and maybe rating count threshold) then fastest submission if tie.

## 6) Time extension rules
- Public challenge baseline max duration: 48h.
- Extension mechanic:
  - If +10 participants join -> add +24h.
  - Another +10 -> +24h, etc.
  - Absolute max challenge duration cap: 7 days.

No reminders/pings for â€œdeadline nearingâ€ in private challenges.
Notifications allowed but not spammy.

## 7) Stats, streaks, badges
- Track:
  - wins count (private friend challenges primarily)
  - avgStars (overall + public/private split)
  - fastest submissions count (optional)
  - daily streak participation (Daily Challenge feature)
- Badges:
  - Bronze: 7 days streak
  - Silver: 14
  - Gold: 28
  - Diamond: 50
- Display badges in-app.

## 8) Daily Challenge
- Add â€œDaily Challengeâ€ (public) concept:
  - Rotates daily per timezone.
  - Helps engagement and streaks.
  - Keep it simple for v1: one daily prompt from DB, public participation.

## 9) Content moderation & reporting
- Report button: translucent â€œ!â€ top-left on each image.
- Reporting supports:
  - report picture
  - report user (if needed)
- User blocking:
  - A user can block another user only if they have previously reported (â€œ!â€) a picture from that user.
- Auto-detection of banned words in report text: nude/naked/kill/etc. (basic keyword scan).
- Admin email: flytlink.app@gmail.com (from Vercel env).
- Reporting pipeline:
  - When report submitted:
    - create DB record
    - email admin with report details + attach image (or provide signed link if attachment too heavy)
    - reporter must choose a reason from list + optional free-text complaint
- Admin dashboard in-app:
  - List reports with preview
  - Buttons:
    - WARN (sends predefined warning email to offender)
    - DELETE (deletes user; sends email stating account deleted due to image upload)
  - Admin decides; system prepares everything for one-click actions.

## 10) Challenge prompt database & admin curation
- There is a DB table of challenge templates (text prompts, categories).
- For user-created free-text challenges:
  - Log them.
  - Show â€œTop 5 suggested new challengesâ€ in admin dashboard for easy review.
  - Admin can edit text & category before approving into templates.

Categories are required (create a starting set and allow extension).

## 11) Search
- Search for users by: username (primary).
- Do NOT expose phone/email search in UI.
- Keep internal DB fields safe; do not leak private info.

## 12) Storage & images
- Store images in Supabase Storage.
- On upload:
  - Convert HEIC and other formats if needed.
  - Generate:
    - optimized display image (good quality)
    - thumbnail
- Store metadata in DB.
- Use signed URLs for delivery.
- When user deletes account:
  - delete all images and related DB records (cascades).
- If a user deletes a challenge/submission:
  - it removes stars, wins, stats associated with that challenge.

## 13) Timezones & localization
- On signup: user provides country + city.
- Ask permission to detect timezone from device; fallback to city/country derived timezone.
- Store user timezone in DB and use it for quiet hours and daily challenge rollovers.

## 14) Notifications (v1)
- Start with: web push + email (later native push).
- Events:
  - new challenge received
  - challenge ended
- Respect quiet hours 22:00â€“06:00 local time.
- Do not spam; keep minimal.

## 15) Public vs private leaderboards
Leaderboards must support filtering:
- week / month / year
- friends-only
- public arena
Also show:
- Top 10 Challengers globally (highest avgStars across sufficient volume)

Define â€œsufficient volumeâ€ threshold (e.g., min 10 rated submissions) to avoid noise.

## 16) System design requirements (Supabase)
Implement:
- Postgres schema with proper relations.
- RLS policies for:
  - user profiles
  - friendships
  - challenges
  - participation
  - submissions
  - ratings
  - reactions
  - reports
  - admin actions
- Use Supabase Auth for identity.
- Admin role: store in profiles table (is_admin boolean) or separate roles table.

## 17) Implementation plan (deliver in milestones)
Milestone 1: Project scaffold
- Next.js App Router setup, Tailwind, Supabase client/server helpers
- Auth: signup, verify gating, login disabled until verified
- Basic layout + bottom nav + camera button

Milestone 2: Friends + profiles
- Profile private/public toggle
- Friend requests + accept
- â€œCome challenge meâ€ share link for public challengers

Milestone 3: Challenge creation + participation
- Create challenge (text + photo imitation)
- Recipient selection (friends/public)
- Submission upload pipeline (optimize + thumbnails + signed URLs)
- Basic challenge detail page

Milestone 4: Rating/voting + winner resolution
- Private challenger rating 0â€“5
- Public rating 1â€“5
- Winner selection logic + phrases (â€œYou did it!â€, â€œYou won!â€, etc. random from a set)
- Reactions heart/fire/wow with on-image counts.

Milestone 5: Leaderboards + stats + badges
- Friends leaderboard (wins)
- Public leaderboard
- Top challengers
- Streak badges

Milestone 6: Moderation + admin dashboard
- Report flow + email notifications
- Admin dashboard with WARN/DELETE actions

Milestone 7: Daily challenge + notifications
- Daily challenge minimal v1
- Web push + email (quiet hours respected)

## 18) â€œprompt.md as source of truthâ€ workflow
- Create `/prompt.md` in repo root and keep it updated with any changes immediately.
- Create `/docs/decisions.md` to log key decisions and changes.
- Create `/docs/todo.md` for next actions.
- When implementing, always:
  1) restate the current requirement briefly,
  2) implement,
  3) add/update tests where feasible,
  4) update docs.

## 19) Deliverables requested from you (Codex)
1) Repo file structure proposal.
2) Supabase SQL schema (tables, indexes, triggers where needed).
3) RLS policies (SQL) for all tables.
4) Next.js implementation with pages/routes/components for the core flows.
5) Image upload/optimization approach (client vs server). Prefer robust approach with server route handling.
6) Admin dashboard + moderation email pipeline (via Supabase Edge Function or Vercel server route).
7) A clear list of environment variables for Vercel.
8) Seed scripts for categories + some starter challenge templates.
9) Minimal UI that feels family-friendly but urban/fashion-inspired (clean typography, strong camera CTA, subtle overlays).

## 20) Constraints & notes
- Keep it simple but correct. Avoid premature complexity.
- No phone/email exposure in search UI.
- Participants only can see private challenge content.
- Public challenge content is visible in public arena; invited users must consent if it becomes public.
- Public star ratings min 1.
- Private star ratings allow 0.
- Always 1 winner; non-winners keep stars on their profile stats.

Now start by producing:
A) the repo structure,
B) the DB schema + RLS,
C) the key pages/components list,
D) the step-by-step implementation for Milestone 1.
