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

    const metadata = user.user_metadata || {};

    return {
        id: user.id,
        email: user.email ?? "",
        username: metadata.username ?? metadata.display_name ?? "anonymous",
        displayName: metadata.display_name ?? metadata.username ?? "Anonymous",
        country: metadata.country,
        city: metadata.city,
        timezone: metadata.timezone,
        emailVerified: !!user.email_confirmed_at,
        createdAt: user.created_at,
    };
}

export function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!domain) return email;

    const visibleChars = Math.min(2, local.length);
    const masked = local.slice(0, visibleChars) + "***";
    return `${masked}@${domain}`;
}
