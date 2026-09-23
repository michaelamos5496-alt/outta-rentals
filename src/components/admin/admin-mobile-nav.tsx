"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminAccount } from "@/components/admin/admin-account";

/** Phone/tablet header: green bar with the logo and a menu showing every admin page. */
function AdminMobileNav({ email }: { email: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-brand px-4 py-3 lg:hidden">
      <Link href="/admin" aria-label="Admin dashboard">
        <Image
          src="/brand/outta-logo-dark.png"
          alt="OUTTA Rentals"
          width={595}
          height={225}
          className="h-8 w-auto"
          priority
        />
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open admin menu"
            className="text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 gap-0 border-none bg-brand p-4 text-brand-foreground [&>[data-slot=sheet-close]]:text-brand-foreground"
        >
          <SheetTitle className="sr-only">Admin menu</SheetTitle>
          <Image
            src="/brand/outta-logo-dark.png"
            alt="OUTTA Rentals"
            width={595}
            height={225}
            className="mb-8 h-9 w-auto self-start"
          />
          <AdminSidebar onNavigate={() => setOpen(false)} />
          <div className="mt-auto">
            <AdminAccount email={email} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

export { AdminMobileNav };
