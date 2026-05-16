"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api";
import { getAccessToken, isAccessTokenExpired } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
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
      await signup(email, password, fullName, orgName);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk-bg-muted)" }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg" style={{ background: "var(--dk-bg)" }}>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--dk-fg-1)", fontFamily: "var(--dk-font-sans)" }}>
          Create your account
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--dk-fg-2)" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--dk-brand)" }} className="hover:underline">
            Sign in
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
              Organization name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "var(--dk-gray-100)", borderColor: "var(--dk-border)", color: "var(--dk-fg-1)" }}
              placeholder="Acme Warehousing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--dk-fg-2)" }}>
              Your name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "var(--dk-gray-100)", borderColor: "var(--dk-border)", color: "var(--dk-fg-1)" }}
              placeholder="Jane Smith"
            />
          </div>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "var(--dk-gray-100)", borderColor: "var(--dk-border)", color: "var(--dk-fg-1)" }}
              placeholder="Min. 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium text-sm transition-opacity disabled:opacity-60"
            style={{ background: "var(--dk-brand)", color: "#fff" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
