import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isVerified(user: { email_confirmed_at?: string | null; confirmed_at?: string | null }) {
  return Boolean(user.email_confirmed_at || user.confirmed_at);
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase service role configuration." },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const cutoff = Date.now() - ONE_DAY_MS;
  let page = 1;
  const perPage = 200;
  let deleted = 0;
  let scanned = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = data.users;
    if (!users.length) {
      break;
    }

    scanned += users.length;

    for (const user of users) {
      const createdAt = new Date(user.created_at).getTime();
      if (!isVerified(user) && createdAt < cutoff) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (!deleteError) {
          deleted += 1;
        }
      }
    }

    if (users.length < perPage) {
      break;
    }
    page += 1;
  }

  return NextResponse.json({ deleted, scanned });
}
