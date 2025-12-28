"use client";

import { signOut } from "@/app/auth/actions";

export default function LogoutButton() {
    return (
        <form action={signOut}>
            <button
                type="submit"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
                Log out
            </button>
        </form>
    );
}
