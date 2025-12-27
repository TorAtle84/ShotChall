"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type VerifyEmailStatusProps = {
  code?: string;
  tokenHash?: string;
  type?: string;
};

type Status = "idle" | "verifying" | "success" | "error";

const otpTypes = new Set([
  "signup",
  "invite",
  "recovery",
  "email_change",
  "magiclink",
]);

export default function VerifyEmailStatus({
  code,
  tokenHash,
  type,
}: VerifyEmailStatusProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) {
      return;
    }
    if (!code && !tokenHash) {
      return;
    }
    ranRef.current = true;

    const run = async () => {
      setStatus("verifying");

      const supabase = createSupabaseBrowserClient();

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        setStatus("success");
        setMessage("Email verified. You can continue to ShotChall.");
        return;
      }

      if (!type || !otpTypes.has(type)) {
        setStatus("error");
        setMessage("Verification link is missing a valid type.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        type: type as
          | "signup"
          | "invite"
          | "recovery"
          | "email_change"
          | "magiclink",
        token_hash: tokenHash ?? "",
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("success");
      setMessage("Email verified. You can continue to ShotChall.");
    };

    void run();
  }, [code, tokenHash, type]);

  if (status === "idle") {
    return null;
  }

  if (status === "verifying") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Confirming your email...
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        {message}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
      {message}
    </div>
  );
}
