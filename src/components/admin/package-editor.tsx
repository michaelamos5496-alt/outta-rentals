"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePackageAction, resetPackageAction, deletePackageAction } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/currency";
import type { PackageRole, ProductionPackage } from "@/lib/packages/types";

const ROLES: PackageRole[] = ["Camera", "Lens", "Lighting", "Audio", "Support", "Accessories", "Monitoring"];

interface ProductOption {
  slug: string;
  name: string;
  dayRate: number;
  currency: string;
}

interface DraftItem {
  key: string;
  role: PackageRole;
  productSlug: string;
  orProductSlug: string;
  dayRate: string;
  quantity: string;
}

interface DraftTier {
  /** Stable id for React keys; `slug` is undefined for a tier added in this session. */
  id: string;
  slug?: string;
  label: string;
  discountPercent: string;
  currency: string;
  items: DraftItem[];
}

const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

let keyCounter = 0;
const nextKey = () => `item-${++keyCounter}`;

function toDraft(pkg: ProductionPackage): DraftTier[] {
  return pkg.tiers.map((t) => ({
    id: nextKey(),
    slug: t.slug,
    label: t.label,
    discountPercent: String(t.discountPercent ?? 0),
    currency: t.currency ?? "GHS",
    items: t.items.map((i) => ({
      key: nextKey(),
      role: i.role,
      productSlug: i.productSlug,
      orProductSlug: i.orProductSlug ?? "",
      dayRate: i.dayRate !== undefined ? String(i.dayRate) : "",
      quantity: String(i.quantity),
    })),
  }));
}

function blankTier(products: ProductOption[]): DraftTier {
  return {
    id: nextKey(),
    label: "",
    discountPercent: "20",
    currency: "GHS",
    items: [
      { key: nextKey(), role: "Camera", productSlug: products[0]?.slug ?? "", orProductSlug: "", dayRate: "", quantity: "1" },
    ],
  };
}

function PackageEditor({
  pkg,
  products,
  edited,
}: {
  /** The package being edited, or null to create a new one. */
  pkg: ProductionPackage | null;
  products: ProductOption[];
  edited: boolean;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(pkg?.name ?? "");
  const [description, setDescription] = React.useState(pkg?.description ?? "");
  const [tiers, setTiers] = React.useState<DraftTier[]>(() => (pkg ? toDraft(pkg) : [blankTier(products)]));
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null);

  const rateOf = React.useMemo(() => new Map(products.map((p) => [p.slug, p.dayRate])), [products]);

  function updateTier(index: number, patch: Partial<DraftTier>) {
    setTiers((all) => all.map((t, i) => (i === index ? { ...t, ...patch } : t)));
    setMessage(null);
  }

  function updateItem(tierIndex: number, key: string, patch: Partial<DraftItem>) {
    setTiers((all) =>
      all.map((t, i) =>
        i === tierIndex ? { ...t, items: t.items.map((it) => (it.key === key ? { ...it, ...patch } : it)) } : t
      )
    );
    setMessage(null);
  }

  function addTier() {
    setTiers((all) => [...all, blankTier(products)]);
    setMessage(null);
  }

  function removeTier(index: number) {
    if (tiers.length <= 1) return;
    if (!window.confirm("Remove this tier from the package?")) return;
    setTiers((all) => all.filter((_, i) => i !== index));
    setMessage(null);
  }

  function addItem(tierIndex: number) {
    setTiers((all) =>
      all.map((t, i) =>
        i === tierIndex
          ? {
              ...t,
              items: [
                ...t.items,
                { key: nextKey(), role: "Accessories", productSlug: products[0]?.slug ?? "", orProductSlug: "", dayRate: "", quantity: "1" },
              ],
            }
          : t
      )
    );
    setMessage(null);
  }

  function removeItem(tierIndex: number, key: string) {
    setTiers((all) =>
      all.map((t, i) => (i === tierIndex ? { ...t, items: t.items.filter((it) => it.key !== key) } : t))
    );
    setMessage(null);
  }

  /** The tier's numbers as they stand in the form — before and after the discount. */
  function totals(tier: DraftTier) {
    let original = 0;
    for (const it of tier.items) {
      const own = it.dayRate.trim() !== "" ? Number(it.dayRate) || 0 : undefined;
      const a = own ?? rateOf.get(it.productSlug) ?? 0;
      const b = it.orProductSlug ? (own ?? rateOf.get(it.orProductSlug) ?? 0) : 0;
      original += Math.max(a, b) * (Math.floor(Number(it.quantity)) || 0);
    }
    const percent = Math.min(90, Math.max(0, Number(tier.discountPercent) || 0));
    const price = Math.round((original * (100 - percent)) / 100);
    return { original, price, saving: original - price, percent };
  }

  async function handleSave() {
    setBusy(true);
    setMessage(null);
    const result = await savePackageAction({
      slug: pkg?.slug,
      name,
      description,
      tiers: tiers.map((t) => ({
        slug: t.slug,
        label: t.label,
        discountPercent: Number(t.discountPercent) || 0,
        items: t.items.map((it) => ({
          role: it.role,
          productSlug: it.productSlug,
          orProductSlug: it.orProductSlug || undefined,
          dayRate: it.dayRate.trim() === "" ? undefined : Number(it.dayRate),
          quantity: Number(it.quantity),
        })),
      })),
    });
    setBusy(false);
    if (result.ok) {
      if (!pkg) {
        router.push(`/admin/packages/${result.slug}`);
        return;
      }
      setMessage({ ok: true, text: "Saved. The site now shows the new items and prices." });
      router.refresh();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset this package to its original items and prices? Your edits will be lost.")) return;
    setBusy(true);
    if (!pkg) return;
    const result = await resetPackageAction(pkg.slug);
    setBusy(false);
    if (result.ok) {
      router.refresh();
      window.location.reload();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  async function handleDelete() {
    if (!pkg) return;
    if (!window.confirm(`Delete the "${pkg.name}" package? This can't be undone.`)) return;
    setBusy(true);
    const result = await deletePackageAction(pkg.slug);
    setBusy(false);
    if (result.ok) router.push("/admin/packages");
    else setMessage({ ok: false, text: result.error });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_2fr]">
        <div>
          <label className="text-label" htmlFor="pkg-name">Name</label>
          <Input id="pkg-name" className="mt-1.5" placeholder="e.g. Podcast" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-label" htmlFor="pkg-desc">Description</label>
          <Input id="pkg-desc" className="mt-1.5" placeholder="One line shown on the package card" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      {tiers.map((tier, ti) => {
        const t = totals(tier);
        return (
          <section key={tier.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-40">
                <label className="text-label" htmlFor={`label-${tier.id}`}>Tier name</label>
                <Input
                  id={`label-${tier.id}`}
                  className="mt-1.5"
                  placeholder="e.g. LITE"
                  value={tier.label}
                  onChange={(e) => updateTier(ti, { label: e.target.value })}
                />
              </div>
              <div className="w-32">
                <label className="text-label" htmlFor={`disc-${tier.id}`}>Discount %</label>
                <Input
                  id={`disc-${tier.id}`}
                  className="mt-1.5"
                  type="number"
                  min={0}
                  max={90}
                  value={tier.discountPercent}
                  onChange={(e) => updateTier(ti, { discountPercent: e.target.value })}
                />
              </div>

              <dl className="ml-auto grid grid-cols-3 gap-x-6 text-right font-mono text-sm">
                <div>
                  <dt className="text-label font-sans">Total</dt>
                  <dd className="mt-1 text-muted-foreground line-through">{formatPrice(t.original, tier.currency)}</dd>
                </div>
                <div>
                  <dt className="text-label font-sans">You save</dt>
                  <dd className="mt-1">{formatPrice(t.saving, tier.currency)}</dd>
                </div>
                <div>
                  <dt className="text-label font-sans">Package price</dt>
                  <dd className="mt-1 text-base font-bold text-brand">{formatPrice(t.price, tier.currency)}/day</dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-2 font-medium">Role</th>
                    <th className="pb-2 pr-2 font-medium">Item</th>
                    <th className="pb-2 pr-2 font-medium">Or choose between (optional)</th>
                    <th className="w-20 pb-2 pr-2 font-medium">Qty</th>
                    <th className="w-28 pb-2 pr-2 font-medium">Rate override</th>
                    <th className="w-10 pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {tier.items.map((it) => (
                    <tr key={it.key} className="align-top">
                      <td className="py-1 pr-2">
                        <select
                          className={selectClass}
                          value={it.role}
                          onChange={(e) => updateItem(ti, it.key, { role: e.target.value as PackageRole })}
                        >
                          {ROLES.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 pr-2">
                        <select
                          className={selectClass}
                          value={it.productSlug}
                          onChange={(e) => updateItem(ti, it.key, { productSlug: e.target.value })}
                        >
                          {products.map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.name} — {formatPrice(p.dayRate, p.currency)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 pr-2">
                        <select
                          className={selectClass}
                          value={it.orProductSlug}
                          onChange={(e) => updateItem(ti, it.key, { orProductSlug: e.target.value })}
                        >
                          <option value="">— none —</option>
                          {products.map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.name} — {formatPrice(p.dayRate, p.currency)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={it.quantity}
                          onChange={(e) => updateItem(ti, it.key, { quantity: e.target.value })}
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Item rate"
                          value={it.dayRate}
                          onChange={(e) => updateItem(ti, it.key, { dayRate: e.target.value })}
                        />
                      </td>
                      <td className="py-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove item"
                          onClick={() => removeItem(ti, it.key)}
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => addItem(ti)}>
                <Plus /> Add item
              </Button>
              {tiers.length > 1 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeTier(ti)}>
                  <Trash2 /> Remove tier
                </Button>
              ) : null}
            </div>
          </section>
        );
      })}

      <Button type="button" variant="outline" className="self-start" onClick={addTier}>
        <Plus /> Add tier
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={busy}>
          {busy ? "Saving…" : pkg ? "Save changes" : "Create package"}
        </Button>
        {pkg && edited && !pkg.custom ? (
          <Button type="button" variant="outline" onClick={handleReset} disabled={busy}>
            <RotateCcw /> Reset to original
          </Button>
        ) : null}
        {pkg?.custom ? (
          <Button type="button" variant="outline" onClick={handleDelete} disabled={busy}>
            <Trash2 /> Delete package
          </Button>
        ) : null}
        {message ? (
          <p className={`flex items-center gap-2 text-sm ${message.ok ? "text-brand" : "text-destructive"}`}>
            {message.ok ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { PackageEditor };
