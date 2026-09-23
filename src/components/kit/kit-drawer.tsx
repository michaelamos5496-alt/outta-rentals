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
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { resolveKitLines } from "@/lib/kit/pricing";

function KitDrawer() {
  const { drawerOpen, closeDrawer, openDrawer, itemCount, items, startDate, endDate, rentalDays, dateError, projectInfo } =
    useKit();
  const lines = resolveKitLines(items, rentalDays ?? 0);

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
                <WhatsAppButton
                  items={lines.map((l) => ({ name: l.product.name, quantity: l.quantity }))}
                  startDate={dateError ? undefined : startDate}
                  endDate={dateError ? undefined : endDate}
                  projectLabel={projectInfo.projectName || projectInfo.productionType}
                  notes={projectInfo.notes}
                  variant="default"
                  className="w-full"
                />
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
