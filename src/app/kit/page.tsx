"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle, Package, SearchCheck } from "lucide-react";

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
import { resolveKitLines, getKitTotal } from "@/lib/kit/pricing";
import { kitPresets } from "@/lib/placeholder-data";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { checkKitAvailability, type KitAvailabilityResult } from "@/lib/catalogue/actions";
import { formatPrice } from "@/lib/currency";

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-label mb-4">{children}</p>;
}

export default function KitPage() {
  const { items, startDate, endDate, rentalDays, dateError, projectInfo, setProjectInfo, clearKit } =
    useKit();

  const lines = resolveKitLines(items, rentalDays ?? 0);
  const total = getKitTotal(lines);
  const canPrice = !dateError && rentalDays !== null;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  const [checking, setChecking] = React.useState(false);
  const [availabilityResults, setAvailabilityResults] = React.useState<
    KitAvailabilityResult[] | null
  >(null);

  async function handleCheckAvailability() {
    setChecking(true);
    setAvailabilityResults(null);
    const results = await checkKitAvailability(items, startDate, endDate);
    setAvailabilityResults(results);
    setChecking(false);
  }

  if (items.length === 0) {
    return (
      <Section>
        <Heading level="h1" eyebrow="Kit">
          Your kit
        </Heading>
        <div className="mt-10">
          <EmptyState
            icon={Package}
            title="Your kit is empty"
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
    <Section>
      <div className="flex items-start justify-between gap-4">
        <Heading level="h1" eyebrow="Kit">
          Your kit
        </Heading>
        <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={clearKit}>
          Clear kit
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

            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={!canPrice || checking}
              onClick={handleCheckAvailability}
            >
              {checking ? <LoaderCircle className="animate-spin" /> : <SearchCheck />}
              Check availability for these dates
            </Button>

            {availabilityResults ? (
              <div className="mt-4 flex flex-col gap-2">
                {availabilityResults.map((result) => (
                  <div
                    key={result.productSlug}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    {result.available ? (
                      <CheckCircle2 className="size-4 shrink-0 text-brand" />
                    ) : (
                      <AlertCircle className="size-4 shrink-0 text-destructive" />
                    )}
                    <span className="text-muted-foreground">{result.productName}</span>
                    <span>
                      {result.available
                        ? "Available for these dates"
                        : result.availableQuantity !== null
                          ? `Only ${result.availableQuantity} available for these dates`
                          : "Not available for these dates"}
                    </span>
                  </div>
                ))}
                {availabilityResults[0]?.source === "status-only" ? (
                  <p className="text-meta mt-1">
                    Based on current status only — live date-range checking
                    activates once OUTTA&rsquo;s inventory system is connected.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
          <SectionLabel>Estimated pricing</SectionLabel>
          <div className="flex flex-col gap-2">
            {lines.map((line) => (
              <div key={line.product.slug} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {line.product.name} × {line.quantity}
                </span>
                <span className="font-mono">{canPrice ? formatPrice(line.lineTotal) : "—"}</span>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Estimated total</span>
            <span className="text-h3 font-mono">{canPrice ? formatPrice(total) : "—"}</span>
          </div>
          <p className="text-meta mt-2">
            {canPrice
              ? "Estimate — final quote confirmed by OUTTA."
              : "Set valid rental dates to see an estimate."}
          </p>

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
            {canPrice ? (
              <Button asChild className="w-full">
                <Link href="/quote">Continue to Quote</Link>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Continue to Quote
              </Button>
            )}
            <WhatsAppButton
              items={lines.map((l) => ({ name: l.product.name, quantity: l.quantity }))}
              startDate={startDate}
              endDate={endDate}
              projectLabel={projectInfo.projectName || projectInfo.productionType}
              variant="outline"
              className="w-full"
            />
            <Button asChild variant="ghost" className="w-full">
              <Link href="/equipment">Continue browsing</Link>
            </Button>
          </div>
        </aside>
      </div>
    </Section>
  );
}
