"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || { form: "Registration failed" });
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #a2a9b1",
    fontSize: "0.875em",
    color: "#202122",
    backgroundColor: "#fff",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.875em",
    color: "#202122",
    marginBottom: "4px",
  };

  const errorStyle = {
    fontSize: "0.8em",
    color: "#d33",
    marginTop: "3px",
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", fontFamily: "Linux Libertine, Georgia, Times, serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #a2a9b1", padding: "8px 20px", backgroundColor: "#fff" }}>
        <span style={{ fontFamily: "Linux Libertine, Georgia, serif", fontSize: "1.2em", color: "#202122" }}>
          WikiHome
        </span>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 20px", display: "flex", gap: "40px" }}>
        {/* Left: Form */}
        <div style={{ flex: "0 0 360px" }}>
          <h1 style={{ fontFamily: "Linux Libertine, Georgia, serif", fontSize: "1.95em", fontWeight: "normal", borderBottom: "1px solid #a2a9b1", paddingBottom: "4px", marginBottom: "16px", color: "#202122" }}>
            Create account
          </h1>

          {errors.form && (
            <div style={{ border: "1px solid #d33", backgroundColor: "#fee7e6", padding: "8px 12px", marginBottom: "12px", fontSize: "0.875em", color: "#202122" }}>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label htmlFor="name" style={labelStyle}>Your name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                autoComplete="name"
              />
              {errors.name && <p style={errorStyle}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label htmlFor="email" style={labelStyle}>Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                autoComplete="email"
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <p style={{ fontSize: "0.8em", color: "#54595d", marginBottom: "4px" }}>
                Use at least 8 characters.
              </p>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                autoComplete="new-password"
              />
              {errors.password && <p style={errorStyle}>{errors.password}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: "6px 16px", backgroundColor: "#f8f9fa", border: "1px solid #a2a9b1", color: "#202122", fontSize: "0.875em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Creating account..." : "Create your account"}
            </button>
          </form>

          <p style={{ marginTop: "16px", fontSize: "0.875em", color: "#202122" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#3366cc" }}>
              Log in
            </Link>
          </p>
        </div>

        {/* Right: Info panel */}
        <div style={{ flex: 1, borderLeft: "1px solid #a2a9b1", paddingLeft: "40px", paddingTop: "8px" }}>
          <p style={{ fontSize: "1em", color: "#202122", fontWeight: "bold", marginBottom: "16px" }}>
            WikiHome is made for people like you.
          </p>
          <p style={{ fontSize: "0.875em", color: "#202122", lineHeight: "1.6", marginBottom: "12px" }}>
            Create a wiki for your home — document every room, appliance, system, and manual in one organized place.
          </p>
          <p style={{ fontSize: "0.875em", color: "#202122", lineHeight: "1.6", marginBottom: "12px" }}>
            Upload images and PDFs and let AI turn them into structured wiki pages automatically.
          </p>
          <p style={{ fontSize: "0.875em", color: "#202122", lineHeight: "1.6" }}>
            Share with family members or keep it private. Your home, documented.
          </p>
        </div>
      </div>
    </div>
  );
}