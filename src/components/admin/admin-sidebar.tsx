"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  Package,
  Tags,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AlertsBadge } from "@/components/admin/admin-alerts";

// Records first (what's used daily), catalogue after.
const navGroups = [
  [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "Orders", icon: ClipboardCheck },
    { href: "/admin/quotes", label: "Quotes", icon: FileText },
    { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ],
  [
    { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tags },
  ],
];

/** Admin navigation, styled for the green brand sidebar. */
function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5" aria-label="Admin">
      {navGroups.map((group, i) => (
        <div key={i} className="flex flex-col gap-1">
          {i > 0 ? (
            <p className="px-3 pb-1 text-[0.6875rem] font-medium tracking-wider text-brand-foreground/60 uppercase">
              Catalogue
            </p>
          ) : null}
          {group.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link prefetch={false}
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-brand-foreground font-semibold text-brand shadow-sm"
                    : "text-brand-foreground/85 hover:bg-brand-foreground/10 hover:text-brand-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
                {item.href === "/admin" ? <AlertsBadge /> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export { AdminSidebar };
