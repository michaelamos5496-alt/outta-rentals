import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cardMinutes,
  exposureStops,
  isOffSpeed,
  komodoItems,
  komodoStartState,
  maxFpsFor,
  normalizeKomodo,
  recFpsOptions,
  type KomodoState,
} from "@/lib/simulators/komodo";

const set = (patch: Partial<KomodoState>, changed?: keyof KomodoState) =>
  normalizeKomodo({ ...komodoStartState, ...patch }, changed);

describe("KOMODO simulator settings", () => {
  it("caps frame rate by format, as in RED's spec sheet", () => {
    assert.equal(maxFpsFor(set({ format: "6K 17:9" })), 40);
    assert.equal(maxFpsFor(set({ format: "6K 2.4:1" })), 50);
    assert.equal(maxFpsFor(set({ format: "5K 17:9" })), 48);
    assert.equal(maxFpsFor(set({ format: "4K 17:9" })), 60);
    assert.equal(maxFpsFor(set({ format: "2K 17:9" })), 120);
  });

  it("pulls the frame rate down when a larger format can't reach it", () => {
    const s = set({ format: "6K 17:9", recFps: "120" });
    assert.ok(parseFloat(s.recFps) <= 40);
    assert.ok(!recFpsOptions(s).includes("48"));
  });

  it("sets the recording frame rate to match a new time base", () => {
    const s = set({ format: "4K 17:9", recFps: "60", timeBase: "25" }, "timeBase");
    assert.equal(s.recFps, "25");
    assert.equal(isOffSpeed(s), false);
    assert.equal(isOffSpeed(set({ format: "4K 17:9", recFps: "48" })), true);
  });

  it("limits ProRes 4K to 60 fps and forces 2K for the 2K format", () => {
    assert.equal(maxFpsFor(set({ format: "2K 17:9", fileFormat: "ProRes", proresRes: "4K" })), 120);
    assert.equal(set({ format: "2K 17:9", fileFormat: "ProRes", proresRes: "4K" }).proresRes, "2K");
    assert.ok(komodoItems.r3dQuality.hidden?.(set({ fileFormat: "ProRes" })));
  });

  it("matches RED's 512 GB card times at 6K 17:9 23.98", () => {
    assert.equal(Math.round(cardMinutes(set({ r3dQuality: "HQ" }))), 30);
    assert.equal(Math.round(cardMinutes(set({ r3dQuality: "MQ" }))), 48);
    assert.equal(Math.round(cardMinutes(set({ r3dQuality: "LQ" }))), 77);
  });

  it("counts exposure in stops from ISO, iris and shutter", () => {
    assert.equal(exposureStops(komodoStartState), 0);
    assert.equal(exposureStops(set({ iso: "1600" })), 1);
    assert.ok(Math.abs(exposureStops(set({ iris: "2.8" })) - 1) < 0.05);
  });
});
