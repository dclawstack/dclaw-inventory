"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { getAccessToken, isAccessTokenExpired } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAccessToken() && !isAccessTokenExpired()) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk-bg-muted)" }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg" style={{ background: "var(--dk-bg)" }}>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--dk-fg-1)", fontFamily: "var(--dk-font-sans)" }}>
          Sign in to DClaw Inventory
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--dk-fg-2)" }}>
          Don&apos;t have an account?{" "}
          <a href="/signup" style={{ color: "var(--dk-brand)" }} className="hover:underline">
            Sign up
          </a>
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--dk-fg-2)" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "var(--dk-gray-100)", borderColor: "var(--dk-border)", color: "var(--dk-fg-1)" }}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--dk-fg-2)" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "var(--dk-gray-100)", borderColor: "var(--dk-border)", color: "var(--dk-fg-1)" }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium text-sm transition-opacity disabled:opacity-60"
            style={{ background: "var(--dk-brand)", color: "#fff" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
