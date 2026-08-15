"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { pixelFont, displayFont, bodyFont } from "@/lib/fonts";
import "../builder/builder.css";

type Mode = "signin" | "signup";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/builder";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setNotice(null);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("signin");
          setStatus("idle");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  };

  return (
    <div
      className={`${pixelFont.variable} ${displayFont.variable} ${bodyFont.variable} builder-root flex items-center justify-center px-4`}
    >
      <div className="lego-card w-full max-w-md p-8">
        <div className="flex items-center gap-2">
          <span className="lego-brand-mark" aria-hidden />
          <span className="pixel text-lg" style={{ color: "var(--navy)" }}>
            résumé.build
          </span>
        </div>
        <h1 className="lego-title mt-5" style={{ color: "var(--navy)", fontSize: 30 }}>
          {mode === "signin" ? "sign in" : "start building"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {mode === "signin" ? "Back to your workspace." : "Create your workspace."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lego-input"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="lego-input"
          />

          {error && (
            <p className="pixel text-sm" style={{ color: "var(--orange-deep)" }}>
              {error}
            </p>
          )}
          {notice && (
            <p className="pixel text-sm" style={{ color: "#14532d" }}>
              {notice}
            </p>
          )}

          <button type="submit" disabled={status === "loading"} className="lego-btn w-full">
            {status === "loading" ? "…" : mode === "signin" ? "sign in" : "sign up"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
          }}
          className="pixel mt-4 text-sm underline underline-offset-4"
          style={{ color: "var(--muted)" }}
        >
          {mode === "signin" ? "need an account? sign up" : "have an account? sign in"}
        </button>
      </div>
    </div>
  );
}
