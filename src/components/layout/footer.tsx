import Link from "next/link";

import { siteConfig, footerLinkGroups, legalLinks } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer data-slot="footer" className="border-t border-border bg-background">
      <Container className="py-16 sm:py-20">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="font-heading text-lg font-semibold">
              OUTTA<span className="text-brand">.</span>
            </Link>
            <p className="text-small mt-4 max-w-xs">{siteConfig.tagline}</p>
          </div>

          {footerLinkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-label mb-4">{group.title}</p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-small transition-colors hover:text-foreground"
                    >
                      {link.label}
                      {link.href === "#" ? (
                        <span className="text-muted-foreground/60"> (placeholder)</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Divider className="my-10" />

        <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="text-meta">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-small transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
