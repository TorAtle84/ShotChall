import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ChallengeType = "text" | "photo";
export type ChallengeVisibility = "private" | "public";
export type ChallengeStatus = "draft" | "active" | "ended" | "cancelled";

export type ChallengeTemplate = {
    id: string;
    text: string;
    categoryId: string | null;
    categoryName?: string;
};

export type Challenge = {
    id: string;
    challengerId: string;
    challengerUsername?: string;
    type: ChallengeType;
    templateId: string | null;
    promptText: string | null;
    referenceImagePath: string | null;
    transformMode: string | null;
    rulesNote: string | null;
    visibility: ChallengeVisibility;
    status: ChallengeStatus;
    baseTimeLimitHours: number;
    extensionHours: number;
    startAt: string | null;
    endAt: string | null;
    createdAt: string;
    participantCount?: number;
    submissionCount?: number;
};

export async function getChallengeTemplates(): Promise<ChallengeTemplate[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("challenge_templates")
        .select(`
      id,
      text,
      category_id,
      category:challenge_categories(name)
    `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error || !data) return [];

    return data.map((t: any) => ({
        id: t.id,
        text: t.text,
        categoryId: t.category_id,
        categoryName: t.category?.name,
    }));
}

export async function getChallengeCategories() {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("challenge_categories")
        .select("id, name, slug")
        .order("name");

    if (error || !data) return [];

    return data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
    }));
}

export async function getMyChallenges(): Promise<Challenge[]> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("challenges")
        .select(`
      id,
      challenger_id,
      type,
      template_id,
      prompt_text,
      reference_image_path,
      transform_mode,
      rules_note,
      visibility,
      status,
      base_time_limit_hours,
      extension_hours,
      start_at,
      end_at,
      created_at,
      challenger:profiles!challenges_challenger_id_fkey(username)
    `)
        .eq("challenger_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error || !data) return [];

    return data.map((c: any) => ({
        id: c.id,
        challengerId: c.challenger_id,
        challengerUsername: c.challenger?.username,
        type: c.type,
        templateId: c.template_id,
        promptText: c.prompt_text,
        referenceImagePath: c.reference_image_path,
        transformMode: c.transform_mode,
        rulesNote: c.rules_note,
        visibility: c.visibility,
        status: c.status,
        baseTimeLimitHours: c.base_time_limit_hours,
        extensionHours: c.extension_hours,
        startAt: c.start_at,
        endAt: c.end_at,
        createdAt: c.created_at,
    }));
}

export async function getReceivedChallenges(): Promise<Challenge[]> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("challenge_members")
        .select(`
      challenge:challenges(
        id,
        challenger_id,
        type,
        template_id,
        prompt_text,
        reference_image_path,
        transform_mode,
        rules_note,
        visibility,
        status,
        base_time_limit_hours,
        extension_hours,
        start_at,
        end_at,
        created_at,
        challenger:profiles!challenges_challenger_id_fkey(username)
      )
    `)
        .eq("user_id", user.id)
        .eq("role", "participant")
        .neq("status", "declined")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error || !data) return [];

    return data
        .filter((m: any) => m.challenge)
        .map((m: any) => {
            const c = m.challenge;
            return {
                id: c.id,
                challengerId: c.challenger_id,
                challengerUsername: c.challenger?.username,
                type: c.type,
                templateId: c.template_id,
                promptText: c.prompt_text,
                referenceImagePath: c.reference_image_path,
                transformMode: c.transform_mode,
                rulesNote: c.rules_note,
                visibility: c.visibility,
                status: c.status,
                baseTimeLimitHours: c.base_time_limit_hours,
                extensionHours: c.extension_hours,
                startAt: c.start_at,
                endAt: c.end_at,
                createdAt: c.created_at,
            };
        });
}

export async function getChallenge(id: string): Promise<Challenge | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("challenges")
        .select(`
      id,
      challenger_id,
      type,
      template_id,
      prompt_text,
      reference_image_path,
      transform_mode,
      rules_note,
      visibility,
      status,
      base_time_limit_hours,
      extension_hours,
      start_at,
      end_at,
      created_at,
      challenger:profiles!challenges_challenger_id_fkey(username)
    `)
        .eq("id", id)
        .single();

    if (error || !data) return null;

    const c: any = data;
    return {
        id: c.id,
        challengerId: c.challenger_id,
        challengerUsername: c.challenger?.username,
        type: c.type,
        templateId: c.template_id,
        promptText: c.prompt_text,
        referenceImagePath: c.reference_image_path,
        transformMode: c.transform_mode,
        rulesNote: c.rules_note,
        visibility: c.visibility,
        status: c.status,
        baseTimeLimitHours: c.base_time_limit_hours,
        extensionHours: c.extension_hours,
        startAt: c.start_at,
        endAt: c.end_at,
        createdAt: c.created_at,
    };
}
