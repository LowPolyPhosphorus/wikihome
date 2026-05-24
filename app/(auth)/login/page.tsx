"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", fontFamily: "Linux Libertine, Georgia, Times, serif" }}>
      {/* Wikipedia-style top bar */}
      <div style={{ borderBottom: "1px solid #a2a9b1", padding: "8px 20px", backgroundColor: "#fff" }}>
        <span style={{ fontFamily: "Linux Libertine, Georgia, serif", fontSize: "1.2em", color: "#202122" }}>
          WikiHome
        </span>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 20px", display: "flex", gap: "40px" }}>
        {/* Left: Form */}
        <div style={{ flex: "0 0 360px" }}>
          <h1 style={{ fontFamily: "Linux Libertine, Georgia, serif", fontSize: "1.95em", fontWeight: "normal", borderBottom: "1px solid #a2a9b1", paddingBottom: "4px", marginBottom: "16px", color: "#202122" }}>
            Log in
          </h1>

          {error && (
            <div style={{ border: "1px solid #d33", backgroundColor: "#fee7e6", padding: "8px 12px", marginBottom: "12px", fontSize: "0.875em", color: "#202122" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label htmlFor="email" style={{ display: "block", fontSize: "0.875em", color: "#202122", marginBottom: "4px" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #a2a9b1", fontSize: "0.875em", color: "#202122", backgroundColor: "#fff", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="password" style={{ display: "block", fontSize: "0.875em", color: "#202122", marginBottom: "4px" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #a2a9b1", fontSize: "0.875em", color: "#202122", backgroundColor: "#fff", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: "6px 16px", backgroundColor: "#f8f9fa", border: "1px solid #a2a9b1", color: "#202122", fontSize: "0.875em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p style={{ marginTop: "16px", fontSize: "0.875em", color: "#202122" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#3366cc" }}>
              Create account
            </Link>
          </p>
        </div>

        {/* Right: Info panel */}
        <div style={{ flex: 1, borderLeft: "1px solid #a2a9b1", paddingLeft: "40px", paddingTop: "8px" }}>
          <p style={{ fontSize: "1em", color: "#202122", fontWeight: "bold", marginBottom: "16px" }}>
            WikiHome is made for people like you.
          </p>
          <p style={{ fontSize: "0.875em", color: "#202122", lineHeight: "1.6", marginBottom: "12px" }}>
            Document everything about your home — appliances, systems, manuals, maintenance history — in one place, organized like a wiki.
          </p>
          <p style={{ fontSize: "0.875em", color: "#202122", lineHeight: "1.6" }}>
            Upload images and PDFs and let AI convert them into structured wiki pages. Share your home wiki with family members or keep it private.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}