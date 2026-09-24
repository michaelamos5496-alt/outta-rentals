"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle, Package } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/state";
import { useKit } from "@/components/kit/kit-provider";
import { KitItemRow } from "@/components/kit/kit-item-row";
import { RentalDates } from "@/components/kit/rental-dates";
import { resolveKitLines } from "@/lib/kit/pricing";
import { kitPresets } from "@/lib/placeholder-data";
import { formatPrice, formatTotal } from "@/lib/currency";
import { SendKitButton } from "@/components/kit/send-kit-button";
import { useKitAvailability } from "@/components/kit/use-kit-availability";

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-label mb-4">{children}</p>;
}

export default function KitPage() {
  const { items, rentalDays, dateError, projectInfo, setProjectInfo, clearKit } = useKit();

  const lines = resolveKitLines(items, rentalDays ?? 0);
  const datesValid = !dateError && rentalDays !== null;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const total = formatTotal(lines.map((l) => ({ amount: l.lineTotal, currency: l.product.currency })));

  const { results, unavailable, checking } = useKitAvailability();

  if (items.length === 0) {
    return (
      <Section>
        <Heading level="h1" eyebrow="Cart">
          Your cart
        </Heading>
        <div className="mt-10">
          <EmptyState
            icon={Package}
            title="Your cart is empty"
            description="Browse the catalogue and add equipment — it'll show up here, ready for dates and a quote."
            action={
              <Button asChild variant="outline">
                <Link href="/equipment">Browse equipment</Link>
              </Button>
            }
          />
        </div>
      </Section>
    );
  }

  return (
    <Section className="pb-32 lg:pb-0">
      <div className="flex items-start justify-between gap-4">
        <Heading level="h1" eyebrow="Cart">
          Your cart
        </Heading>
        <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={clearKit}>
          Clear cart
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        <div>
          <SectionLabel>Your equipment · {itemCount} item{itemCount === 1 ? "" : "s"}</SectionLabel>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <KitItemRow key={line.product.slug} line={line} />
            ))}
          </div>

          <div className="mt-12">
            <SectionLabel>Rental dates</SectionLabel>
            <RentalDates />

            {datesValid ? (
              <div className="mt-4 flex flex-col gap-2" aria-live="polite">
                {checking ? (
                  <p className="text-meta flex items-center gap-2">
                    <LoaderCircle className="size-3.5 animate-spin" /> Checking availability…
                  </p>
                ) : unavailable.length === 0 && results.length > 0 ? (
                  <p className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="size-4 shrink-0 text-brand" />
                    Everything in your cart is available for these dates.
                  </p>
                ) : (
                  unavailable.map((result) => (
                    <p key={result.productSlug} className="flex items-start gap-2.5 text-sm">
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <span>
                        <span className="font-medium">{result.productName}</span>{" "}
                        {result.reason === "out_of_service"
                          ? "— currently out of service."
                          : result.availableQuantity
                            ? `— only ${result.availableQuantity} available for these dates.`
                            : "— already booked for these dates."}{" "}
                        <span className="text-muted-foreground">
                          Remove it or choose different dates to check out.
                        </span>
                      </span>
                    </p>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>

        <aside id="checkout-details" className="h-fit scroll-mt-24 border border-border p-6 lg:sticky lg:top-24">
          <SectionLabel>Estimated pricing</SectionLabel>
          <div className="flex flex-col gap-2">
            {lines.map((line) => (
              <div key={line.product.slug} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {line.product.name} × {line.quantity}
                </span>
                <span className="shrink-0 font-mono">
                  {datesValid ? formatPrice(line.lineTotal, line.product.currency) : "—"}
                </span>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium">Estimated total</span>
            <span className="text-h3 font-mono">{datesValid ? total : "—"}</span>
          </div>
          {!datesValid ? (
            <p className="text-meta mt-2">Set valid rental dates to see an estimate.</p>
          ) : null}

          <Divider className="my-6" />

          <SectionLabel>Your details</SectionLabel>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer-name">Name</Label>
              <Input
                id="customer-name"
                autoComplete="name"
                placeholder="Ama Owusu"
                value={projectInfo.customerName}
                onChange={(e) => setProjectInfo({ customerName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                type="tel"
                autoComplete="tel"
                placeholder="024 123 4567"
                value={projectInfo.customerPhone}
                onChange={(e) => setProjectInfo({ customerPhone: e.target.value })}
              />
            </div>
          </div>

          <Divider className="my-6" />

          <SectionLabel>Project information</SectionLabel>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                placeholder="Feature film, Lagos"
                value={projectInfo.projectName}
                onChange={(e) => setProjectInfo({ projectName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="production-type">Production type</Label>
              <Select
                value={projectInfo.productionType}
                onValueChange={(v) => setProjectInfo({ productionType: v })}
              >
                <SelectTrigger id="production-type" className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {kitPresets.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Shoot dates, location, anything OUTTA should know…"
                rows={3}
                value={projectInfo.notes}
                onChange={(e) => setProjectInfo({ notes: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <SendKitButton className="w-full" hint />
            <Button asChild variant="ghost" className="w-full">
              <Link href="/equipment">Continue browsing</Link>
            </Button>
          </div>
        </aside>
      </div>

      {/* Mobile: sticky checkout bar, like Amazon / B&H. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
            <p className="text-meta">
              {datesValid ? `Est. ${total}` : "Set dates for an estimate"}
            </p>
          </div>
          <Button
            size="lg"
            onClick={() =>
              document
                .getElementById("checkout-details")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </Section>
  );
}
