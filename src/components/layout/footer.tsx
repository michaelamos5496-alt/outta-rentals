import Link from "next/link";
import Image from "next/image";

import { siteConfig, primaryNav, footerLinkGroups, legalLinks } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer data-slot="footer" className="relative overflow-hidden border-t border-border bg-background">
      {/* Oversized watermark of the real logo, bleeding off the edge — a texture, not a UI element */}
      <Image
        src="/brand/outta-logo-dark.png"
        alt=""
        aria-hidden
        width={1190}
        height={450}
        className="pointer-events-none absolute -right-24 -bottom-20 w-[640px] max-w-none opacity-[0.05] select-none sm:w-[820px]"
      />

      <Container className="relative py-12 sm:py-20">
        <div className="lg:hidden">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/outta-logo-dark.png"
              alt={siteConfig.name}
              width={595}
              height={225}
              className="h-9 w-auto"
              priority={false}
            />
          </Link>
          <p className="text-small mt-4 max-w-xs">{siteConfig.tagline}</p>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-small transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden grid-cols-2 gap-10 sm:grid-cols-3 lg:grid lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/outta-logo-dark.png"
                alt={siteConfig.name}
                width={595}
                height={225}
                className="h-9 w-auto"
                priority={false}
              />
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

        <Divider className="my-8 lg:my-10" />

        <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="text-meta">
            © {year} {siteConfig.name}. All rights reserved. Developed by{" "}
            <a
              href="https://theimagedept.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              TheImageDept.
            </a>
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
