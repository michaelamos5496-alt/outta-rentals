"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Package, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { duration, easeOutta } from "@/lib/motion";
import { primaryNav } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/state";
import { Modal } from "@/components/ui/modal";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

function Navbar() {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [kitOpen, setKitOpen] = React.useState(false);

  return (
    <header
      data-slot="navbar"
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
      style={{ transitionDuration: `${duration.fast * 1000}ms` }}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between sm:h-20">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-[-0.01em]"
          >
            OUTTA
            <span className="text-brand">.</span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group/link text-label relative text-foreground/70 transition-colors hover:text-foreground"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand transition-all duration-200 ease-out group-hover/link:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Search />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Kit list"
              onClick={() => setKitOpen(true)}
              className="relative hidden sm:inline-flex"
            >
              <Package />
              <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-brand text-[0.5625rem] font-medium text-brand-foreground">
                0
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
            >
              <Menu />
            </Button>
          </div>
        </nav>
      </Container>

      {/* Search — UI shell only, no results wired up yet */}
      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search equipment"
        description="Full catalogue search arrives in a later phase."
        className="sm:max-w-lg"
      >
        <SearchInput autoFocus />
      </Modal>

      {/* Kit list — UI shell only, no cart logic wired up yet */}
      <Drawer open={kitOpen} onOpenChange={setKitOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Your kit</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <EmptyState
              icon={Package}
              title="Your kit is empty"
              description="Add equipment to build a kit and request a quote. Kit building arrives in a later phase."
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast, ease: easeOutta }}
            className="fixed inset-0 z-50 bg-background lg:hidden"
          >
            <Container>
              <div className="flex h-16 items-center justify-between sm:h-20">
                <span className="font-heading text-lg font-semibold">
                  OUTTA<span className="text-brand">.</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <ul className="mt-8 flex flex-col gap-1">
                {primaryNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: duration.base,
                      delay: i * 0.05,
                      ease: easeOutta,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-h3 block py-3"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                >
                  <Search /> Search
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setMobileOpen(false);
                    setKitOpen(true);
                  }}
                >
                  <Package /> Kit
                </Button>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export { Navbar };
