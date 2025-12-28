import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data, error } = await supabase
    .from("profile_private")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (error || !data?.is_admin) {
    throw new Error("Not authorized.");
  }

  return { userId: user.id };
}
