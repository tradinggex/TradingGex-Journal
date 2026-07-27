"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, type AuthState } from "@/actions/auth";
import { useTranslation } from "@/lib/i18n/context";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const t = useTranslation();
  const router = useRouter();
  const [state, action, pending] = useActionState<AuthState, FormData>(login, undefined);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error") === "oauth";

  useEffect(() => {
    if (state?.success) {
      router.replace("/dashboard");
    }
  }, [state, router]);

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative flex items-center justify-center">
          {/* Animated glow behind logo */}
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: 220, height: 220,
              background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(103,58,200,0.10) 55%, transparent 75%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-512.png"
            alt="TradingGex"
            width={200}
            height={200}
            style={{
              filter:
                "drop-shadow(0 0 24px rgba(212,175,55,0.55)) drop-shadow(0 0 60px rgba(103,58,200,0.30))",
              position: "relative",
            }}
          />
        </div>
        <p
          className="text-xs tracking-[0.22em] uppercase font-medium mt-3"
          style={{ color: "rgba(212,175,55,0.70)" }}
        >
          {t("auth.subtitle")}
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: "rgba(4, 2, 14, 0.84)",
          backdropFilter: "blur(24px) saturate(1.3)",
          WebkitBackdropFilter: "blur(24px) saturate(1.3)",
          border: "1px solid rgba(212,175,55,0.18)",
          boxShadow:
            "0 0 0 1px rgba(212,175,55,0.10), 0 24px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Gold top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.60), rgba(255,210,80,0.90), rgba(212,175,55,0.60), transparent)",
          }}
        />

        <h1 className="text-xl font-bold text-foreground mb-1">{t("auth.login.title")}</h1>
        <p className="text-sm mb-6" style={{ color: "rgba(162,150,204,0.80)" }}>
          {t("auth.login.description")}
        </p>

        {/* Google OAuth */}
        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium transition-all mb-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(212,175,55,0.20)",
            color: "var(--color-foreground)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.09)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(212,175,55,0.38)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(212,175,55,0.20)";
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("auth.googleLogin")}
        </a>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.14)" }} />
          <span className="text-xs" style={{ color: "rgba(162,150,204,0.60)" }}>{t("auth.or")}</span>
          <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.14)" }} />
        </div>

        {(state?.message || oauthError) && (
          <div className="mb-4 px-3 py-2.5 rounded-xl text-sm"
            style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171" }}>
            {oauthError ? t("auth.oauthError") : state?.message}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(212,175,55,0.75)" }}>
              {t("auth.login.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl px-3.5 py-3 text-sm transition-all outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.16)",
                color: "var(--color-foreground)",
              }}
              placeholder={t("auth.login.emailPlaceholder")}
              onFocus={e => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.50)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)";
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.16)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-400">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(212,175,55,0.75)" }}>
              {t("auth.login.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl px-3.5 py-3 text-sm transition-all outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.16)",
                color: "var(--color-foreground)",
              }}
              placeholder={t("auth.login.passwordPlaceholder")}
              onFocus={e => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.50)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)";
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.16)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-400">{state.errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all mt-2 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #9a6a20 100%)",
              border: "1px solid rgba(212,175,55,0.30)",
              boxShadow: "0 0 28px rgba(212,175,55,0.18), 0 4px 16px rgba(0,0,0,0.45)",
            }}
            onMouseEnter={e => {
              if (!pending) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 40px rgba(212,175,55,0.32), 0 4px 20px rgba(0,0,0,0.55)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 28px rgba(212,175,55,0.18), 0 4px 16px rgba(0,0,0,0.45)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {pending ? t("auth.login.submitting") : t("auth.login.submit")}
          </button>
        </form>

        <div className="flex items-center justify-between mt-6 pt-5"
          style={{ borderTop: "1px solid rgba(212,175,55,0.10)" }}>
          <p className="text-xs" style={{ color: "rgba(162,150,204,0.65)" }}>
            {t("auth.login.noAccount")}{" "}
            <Link href="/register"
              className="font-semibold transition-colors"
              style={{ color: "rgba(212,175,55,0.85)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#FFD700"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(212,175,55,0.85)"; }}
            >
              {t("auth.login.register")}
            </Link>
          </p>
          <Link href="/forgot-password"
            className="text-xs transition-colors"
            style={{ color: "rgba(162,150,204,0.55)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(212,175,55,0.70)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(162,150,204,0.55)"; }}
          >
            {t("auth.login.forgotPassword")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
