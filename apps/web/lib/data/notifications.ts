import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NotificationType = "challenge_received" | "challenge_ended";

export type Notification = {
    id: string;
    type: NotificationType;
    payload: Record<string, any>;
    createdAt: string;
    readAt: string | null;
};

export async function getNotifications(limit: number = 20): Promise<Notification[]> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("notifications")
        .select("id, type, payload, created_at, read_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    return data.map((n) => ({
        id: n.id,
        type: n.type as NotificationType,
        payload: n.payload || {},
        createdAt: n.created_at,
        readAt: n.read_at,
    }));
}

export async function getUnreadCount(): Promise<number> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);

    if (error) return 0;
    return count || 0;
}

/**
 * Check if current time is within quiet hours (22:00-06:00) for user's timezone
 */
export function isQuietHours(
    timezone: string = "UTC",
    quietStart: string = "22:00",
    quietEnd: string = "06:00"
): boolean {
    const now = new Date();
    const localTime = new Date(
        now.toLocaleString("en-US", { timeZone: timezone })
    );

    const currentHour = localTime.getHours();
    const currentMinute = localTime.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMin] = quietStart.split(":").map(Number);
    const [endHour, endMin] = quietEnd.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 06:00)
    if (startMinutes > endMinutes) {
        // Quiet hours span midnight
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
}

/**
 * Create a notification for a user
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    payload: Record<string, any>
): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type,
        payload,
    });

    return !error;
}
