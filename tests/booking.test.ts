import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildBooking } from "@/lib/quote/booking";
import { buildWhatsAppMessage } from "@/lib/quote/whatsapp";
import { resolveKitBreakdown } from "@/lib/kit/pricing";
import { getPackageBySlug, getTierBySlug, getTierPrice, getTierFullPrice } from "@/lib/packages";
import { getProductBySlug } from "@/lib/catalogue";
import { groupQuoteKit, isPackageOrder, quotePackageLabel } from "@/lib/admin/order-view";
import { quoteTitle } from "@/lib/admin/format";
import { formatPrice } from "@/lib/currency";
import type { AdminQuote } from "@/lib/admin/types";

const ONE_DAY = { startDate: "2030-03-04", endDate: "2030-03-04" };
const THREE_DAYS = { startDate: "2030-03-04", endDate: "2030-03-06" };

function packageCart(packageSlug = "commercial", tierSlug = "lite") {
  const pkg = getPackageBySlug(packageSlug)!;
  const tier = getTierBySlug(pkg, tierSlug)!;
  return {
    pkg,
    tier,
    items: tier.items.map((i) => ({
      productSlug: i.productSlug,
      quantity: i.quantity,
      packageSlug,
      packageTierSlug: tierSlug,
    })),
  };
}

/** Same message the Send Kit button builds, from the same breakdown. */
function messageFor(items: ReturnType<typeof packageCart>["items"], days: number) {
  const b = resolveKitBreakdown(items, days);
  return buildWhatsAppMessage({
    bookingType: b.packages.length > 0 ? "package" : "individual",
    rentalDays: days,
    packages: b.packages.map((g) => ({
      name: `${g.packageName} Package`,
      tierLabel: g.tierLabel,
      quantity: g.quantity,
      dayPrice: formatPrice(g.dayPrice, g.currency),
      total: formatPrice(g.total, g.currency),
      items: g.items.map((l) => ({ name: l.product.name, quantity: l.quantity })),
    })),
    items: b.individuals.map((l) => ({
      name: l.product.name,
      quantity: l.quantity,
      dayRate: l.product.dayRate,
      currency: l.product.currency,
    })),
    total: formatPrice(b.totalEntries.reduce((n, e) => n + e.amount, 0)),
    customerName: "Ama Owusu",
    customerPhone: "0241234567",
    projectLabel: "Test Shoot",
  });
}

describe("package bookings", () => {
  it("1. stores the package name, id, configured price and total", () => {
    const { tier, items } = packageCart();
    const configured = getTierPrice(tier)!.amount;
    const result = buildBooking({ items, ...ONE_DAY });
    assert.ok(result.ok);
    assert.equal(result.hasPackage, true);
    for (const line of result.kit) {
      assert.equal(line.packageSlug, "commercial");
      assert.equal(line.packageName, "Commercial");
      assert.equal(line.packageTierSlug, "lite");
      assert.equal(line.packageTierLabel, "LITE");
      assert.equal(line.packageDayPrice, configured);
    }
    assert.equal(result.estimatedTotal, configured);
  });

  it("2. the WhatsApp message names the package and shows the total", () => {
    const { tier, items } = packageCart();
    const price = getTierPrice(tier)!.amount;
    const message = messageFor(items, 1);
    assert.match(message, /PACKAGE BOOKING/);
    assert.match(message, /Booking Type: Equipment Package/);
    assert.match(message, /Package: Commercial Package — LITE/);
    assert.ok(message.includes(`Package Price: ${formatPrice(price)}/day`));
    assert.ok(message.includes(`Total Amount: ${formatPrice(price)}`));
    assert.match(message, /Equipment Included:/);
    assert.match(message, /Booking Status: Pending Confirmation/);
    assert.match(message, /Name: Ama Owusu/);
  });

  it("3. an individual rental lists each item with its rate and the total", () => {
    const items = [
      { productSlug: "sony-fx3", quantity: 1 },
      { productSlug: "amaran-300c", quantity: 2 },
    ];
    const fx3 = getProductBySlug("sony-fx3")!;
    const amaran = getProductBySlug("amaran-300c")!;
    const message = messageFor(items as never, 1);
    assert.match(message, /INDIVIDUAL RENTAL/);
    assert.match(message, /Individual Equipment Rental/);
    assert.ok(message.includes(`${fx3.name} × 1 — ${formatPrice(fx3.dayRate)}/day`));
    assert.ok(message.includes(`${amaran.name} × 2 — ${formatPrice(amaran.dayRate)}/day`));
    assert.ok(message.includes(`Total Amount: ${formatPrice(fx3.dayRate + amaran.dayRate * 2)}`));
    assert.doesNotMatch(message, /Package:/);
    const booked = buildBooking({ items, ...ONE_DAY });
    assert.ok(booked.ok);
    assert.equal(booked.hasPackage, false);
    assert.equal(booked.estimatedTotal, fx3.dayRate + amaran.dayRate * 2);
  });

  it("4. a package with several items stays one identifiable package", () => {
    const { items } = packageCart("commercial", "yolo");
    assert.ok(items.length > 5);
    const b = resolveKitBreakdown(items, 1);
    assert.equal(b.packages.length, 1);
    assert.equal(b.individuals.length, 0);
    const result = buildBooking({ items, ...ONE_DAY });
    assert.ok(result.ok);
    assert.equal(new Set(result.kit.map((l) => l.packageSlug)).size, 1);
    assert.equal(groupQuoteKit(result.kit).packages.length, 1);
  });

  it("5. uses the configured package price, not the sum of the items", () => {
    const { tier, items } = packageCart();
    const configured = getTierPrice(tier)!.amount;
    const sumOfItems = getTierFullPrice(tier).reduce((n, e) => n + e.amount, 0);
    assert.notEqual(configured, sumOfItems);
    assert.ok(configured < sumOfItems);
    const result = buildBooking({ items, ...ONE_DAY });
    assert.ok(result.ok);
    assert.equal(result.estimatedTotal, configured);
  });

  it("6. ignores prices and package details a customer tampers with", () => {
    const { tier, items } = packageCart();
    const configured = getTierPrice(tier)!.amount;
    const tampered = items.map((i) => ({
      ...i,
      price: 1,
      dayRate: 1,
      packageDayPrice: 1,
      packageName: "Free Package",
    }));
    const result = buildBooking({ items: tampered, estimatedTotal: 1, total: 1, ...ONE_DAY } as never);
    assert.ok(result.ok);
    assert.equal(result.estimatedTotal, configured);
    assert.ok(result.kit.every((l) => l.packageName === "Commercial" && l.packageDayPrice === configured));
    // Cheating the contents instead: drop an item but keep the package tag.
    const trimmed = buildBooking({ items: items.slice(1), ...ONE_DAY });
    assert.ok(trimmed.ok);
    assert.equal(trimmed.hasPackage, false);
    assert.ok(trimmed.warnings.length > 0);
    const ownRates = items
      .slice(1)
      .reduce((n, i) => n + getProductBySlug(i.productSlug)!.dayRate * i.quantity, 0);
    assert.equal(trimmed.estimatedTotal, ownRates);
  });

  it("7. handles missing or unknown package data safely", () => {
    const empty = buildBooking({ items: [], ...ONE_DAY });
    assert.equal(empty.ok, false);
    const junk = buildBooking({ items: [{ productSlug: "nope", quantity: 1 }, { quantity: 2 }, null] as never });
    assert.equal(junk.ok, false);
    const unknown = buildBooking({
      items: [{ productSlug: "sony-fx3", quantity: 1, packageSlug: "ghost", packageTierSlug: "lite" }],
      ...ONE_DAY,
    });
    assert.ok(unknown.ok);
    assert.equal(unknown.hasPackage, false);
    assert.equal(unknown.warnings.length, 1);
    assert.equal(unknown.estimatedTotal, getProductBySlug("sony-fx3")!.dayRate);
    assert.ok(unknown.kit.every((l) => !l.packageSlug));
  });

  it("9. multiplies the package price by the rental days (and copies)", () => {
    const { tier, items } = packageCart();
    const configured = getTierPrice(tier)!.amount;
    const result = buildBooking({ items, ...THREE_DAYS });
    assert.ok(result.ok);
    assert.equal(result.rentalDays, 3);
    assert.equal(result.estimatedTotal, configured * 3);
    const two = buildBooking({
      items: items.map((i) => ({ ...i, quantity: i.quantity * 2 })),
      ...THREE_DAYS,
    });
    assert.ok(two.ok);
    assert.equal(two.estimatedTotal, configured * 2 * 3);
    assert.equal(two.kit[0].packageQuantity, 2);
  });

  it("keeps individually rented extras separate from the package", () => {
    const { tier, items } = packageCart();
    const configured = getTierPrice(tier)!.amount;
    const extra = getProductBySlug("boom-mic")!;
    const result = buildBooking({ items: [...items, { productSlug: "boom-mic", quantity: 1 }], ...ONE_DAY });
    assert.ok(result.ok);
    assert.equal(result.estimatedTotal, configured + extra.dayRate);
    const view = groupQuoteKit(result.kit);
    assert.equal(view.packages.length, 1);
    assert.deepEqual(
      view.individuals.map((l) => l.productSlug),
      ["boom-mic"]
    );
  });
});

describe("admin order display", () => {
  const base: AdminQuote = {
    id: "1",
    customerName: "A",
    customerEmail: "",
    customerPhone: "0240000000",
    customerCompany: "",
    projectName: "",
    projectType: "",
    shootLocation: "",
    startDate: "",
    endDate: "",
    rentalDays: 0,
    estimatedTotal: 0,
    kit: [],
    status: "new",
    notes: [],
    createdAt: "2030-01-01T00:00:00Z",
  };

  it("8. an old order with no package details still reads safely", () => {
    const old = {
      ...base,
      kit: [{ productSlug: "sony-fx3", productName: "Sony FX3", quantity: 1, dayRate: 700 }],
    };
    assert.equal(isPackageOrder(old), false);
    assert.equal(quotePackageLabel(old), "");
    assert.equal(groupQuoteKit(old.kit).individuals.length, 1);
    assert.equal(quoteTitle(old), "Kit request · 1 item");
    // Even an empty or missing snapshot must not throw.
    assert.deepEqual(groupQuoteKit(undefined), { packages: [], individuals: [] });
    assert.deepEqual(groupQuoteKit(null as never), { packages: [], individuals: [] });
  });

  it("10. package orders and individual rentals are told apart", () => {
    const { items } = packageCart();
    const booked = buildBooking({ items, ...ONE_DAY });
    assert.ok(booked.ok);
    const pkgOrder: AdminQuote = { ...base, kit: booked.kit, estimatedTotal: booked.estimatedTotal ?? 0 };
    const plain: AdminQuote = {
      ...base,
      kit: [{ productSlug: "sony-fx3", productName: "Sony FX3", quantity: 1, dayRate: 700 }],
    };
    assert.equal(isPackageOrder(pkgOrder), true);
    assert.equal(isPackageOrder(plain), false);
    assert.equal(quotePackageLabel(pkgOrder), "Commercial — LITE");
    assert.equal(quoteTitle(pkgOrder), "Commercial — LITE");
  });

  it("keeps the package name and price even if the package changes later", () => {
    const { items } = packageCart();
    const booked = buildBooking({ items, ...ONE_DAY });
    assert.ok(booked.ok);
    const snapshot = JSON.parse(JSON.stringify(booked.kit));
    const pkg = getPackageBySlug("commercial")!;
    const original = { name: pkg.name, tiers: structuredClone(pkg.tiers) };
    pkg.name = "Renamed";
    pkg.tiers[0].discountPercent = 50;
    try {
      const view = groupQuoteKit(snapshot);
      assert.equal(view.packages[0].name, "Commercial");
      assert.equal(view.packages[0].dayPrice, getTierPrice(original.tiers[0])!.amount);
    } finally {
      pkg.name = original.name;
      pkg.tiers = original.tiers;
    }
  });
});
