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
import { SendKitButton } from "@/components/kit/send-kit-button";

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
              <div className="mt-3 flex flex-col gap-2">
                <SendKitButton className="w-full" />
                <Button asChild variant="outline" className="w-full" onClick={closeDrawer}>
                  <Link href="/kit">View full kit</Link>
                </Button>
              </div>
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { KitDrawer };
