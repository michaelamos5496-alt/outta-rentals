"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAdmin } from "@/lib/admin/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInAdmin(email, password);

    if (result.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-brand px-4 py-12">
      <Image
        src="/brand/outta-logo-dark.png"
        alt="OUTTA Rentals"
        width={595}
        height={225}
        priority
        className="mb-8 h-12 w-auto"
      />
      <div className="w-full max-w-sm rounded-3xl bg-background p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-4 text-brand" />
          <p className="text-label">Admin</p>
        </div>
        <h1 className="text-h2 mt-2">Sign in</h1>
        <p className="text-small mt-1">Internal access only.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : null}
            Sign in
          </Button>
        </form>
      </div>
      <Link prefetch={false} href="/" className="mt-6 text-sm text-brand-foreground/80 hover:text-brand-foreground">
        ← Back to website
      </Link>
    </div>
  );
}
