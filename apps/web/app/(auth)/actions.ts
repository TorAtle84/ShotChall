"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validatePassword } from "@/lib/validators/auth";

function redirectWithError(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${path}${separator}error=${encodeURIComponent(message)}`;
  redirect(url);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirectWithError("/auth/login", "Email and password are required.");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithError("/auth/login", error.message);
  }

  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut();
    redirectWithError(
      `/auth/verify?email=${encodeURIComponent(email)}`,
      "Verify your email before signing in."
    );
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const username = String(formData.get("username") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const timezone = String(formData.get("timezone") || "").trim();
  const terms = formData.get("terms") === "on";

  if (!email || !password || !username || !country || !city || !timezone) {
    redirectWithError("/auth/signup", "All fields are required.");
  }

  if (!terms) {
    redirectWithError("/auth/signup", "You must accept the terms to continue.");
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    redirectWithError("/auth/signup", passwordError);
  }

  if (username.includes(" ")) {
    redirectWithError("/auth/signup", "Username cannot contain spaces.");
  }

  const supabase = createSupabaseServerClient();
  const origin = headers().get("origin") ?? "";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/verify` : undefined,
      data: {
        username,
        display_name: username,
        country,
        city,
        timezone,
      },
    },
  });

  if (error) {
    redirectWithError("/auth/signup", error.message);
  }

  redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
}

export async function resendVerification(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirectWithError("/auth/verify", "Provide an email address to resend.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    redirectWithError(`/auth/verify?email=${encodeURIComponent(email)}`, error.message);
  }

  redirect(`/auth/verify?email=${encodeURIComponent(email)}&sent=1`);
}
