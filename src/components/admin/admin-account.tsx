import { ExternalLink } from "lucide-react";

import { SignOutButton } from "@/components/admin/sign-out-button";
import { NotificationToggle } from "@/components/admin/admin-alerts";

/** Signed-in email, a link to the public site, and sign out — bottom of the green sidebar. */
function AdminAccount({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-brand-foreground/20 pt-4">
      <p className="truncate px-3 pb-1 text-xs text-brand-foreground/70" title={email}>
        {email}
      </p>
      <NotificationToggle />
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-foreground/85 transition-colors hover:bg-brand-foreground/10 hover:text-brand-foreground"
      >
        <ExternalLink className="size-4" /> View website
      </a>
      <SignOutButton className="justify-start gap-3 rounded-xl px-3 text-brand-foreground/85 hover:bg-brand-foreground/10 hover:text-brand-foreground" />
    </div>
  );
}

export { AdminAccount };
