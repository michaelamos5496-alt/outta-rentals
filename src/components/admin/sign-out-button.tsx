"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutAdmin } from "@/lib/admin/auth";

function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOutAdmin();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={loading}>
      <LogOut /> Sign out
    </Button>
  );
}

export { SignOutButton };
