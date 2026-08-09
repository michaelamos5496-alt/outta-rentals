"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle, LockKeyhole } from "lucide-react";

import { Container } from "@/components/ui/container";
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
    <Container width="narrow" className="flex min-h-[70svh] items-center py-16">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-5 text-brand" />
          <p className="text-label">OUTTA Admin</p>
        </div>
        <h1 className="text-h2 mt-3">Sign in</h1>
        <p className="text-small mt-2">Internal access only.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
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
    </Container>
  );
}
