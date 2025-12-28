import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
    id: string;
    email: string;
    username: string;
    displayName: string;
    country?: string;
    city?: string;
    timezone?: string;
    emailVerified: boolean;
    createdAt: string;
    isPublic: boolean;
    isPublicChallenger: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    // Get profile data for visibility settings
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_public, is_public_challenger, username, display_name")
        .eq("id", user.id)
        .single();

    const metadata = user.user_metadata || {};

    return {
        id: user.id,
        email: user.email ?? "",
        username: profile?.username ?? metadata.username ?? "anonymous",
        displayName: profile?.display_name ?? metadata.display_name ?? "Anonymous",
        country: metadata.country,
        city: metadata.city,
        timezone: metadata.timezone,
        emailVerified: !!user.email_confirmed_at,
        createdAt: user.created_at,
        isPublic: profile?.is_public ?? false,
        isPublicChallenger: profile?.is_public_challenger ?? false,
    };
}

export function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!domain) return email;

    const visibleChars = Math.min(2, local.length);
    const masked = local.slice(0, visibleChars) + "***";
    return `${masked}@${domain}`;
}
