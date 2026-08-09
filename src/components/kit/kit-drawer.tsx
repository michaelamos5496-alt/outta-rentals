"use client";

import Link from "next/link";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { KitSummary } from "@/components/kit/kit-summary";
import { useKit } from "@/components/kit/kit-provider";

function KitDrawer() {
  const { drawerOpen, closeDrawer, openDrawer, itemCount } = useKit();

  return (
    <Drawer open={drawerOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
      <DrawerContent className="overflow-y-auto sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Your kit{itemCount > 0 ? ` · ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-1 flex-col px-4 pb-6">
          <KitSummary
            compact
            emptyAction={
              <Button asChild variant="outline" onClick={closeDrawer}>
                <Link href="/equipment">Browse equipment</Link>
              </Button>
            }
            footer={
              <Button asChild className="mt-3 w-full" onClick={closeDrawer}>
                <Link href="/kit">View full kit</Link>
              </Button>
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { KitDrawer };
