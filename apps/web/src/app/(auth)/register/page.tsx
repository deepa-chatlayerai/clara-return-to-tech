"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Chrome } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    // Auto sign in after register
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/onboarding",
    });
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/onboarding" });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-3xl font-bold text-primary">
            Clara
          </Link>
          <p className="text-text-muted text-sm mt-2">
            Your return to tech starts here 🌿
          </p>
        </div>

        <div className="card p-8">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-border rounded py-2.5 text-sm font-medium text-text-primary hover:bg-background transition-colors mb-6"
          >
            <Chrome size={16} />
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-text-muted bg-surface px-3">
              or create an account
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your name</label>
              <input
                type="text"
                className="input"
                placeholder="Deepa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-2.5"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>

          <p className="text-xs text-text-muted text-center mt-4">
            Free forever. No credit card needed.
          </p>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
