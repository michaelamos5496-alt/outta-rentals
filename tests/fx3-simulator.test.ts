import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  frameRatesFor,
  fx3Items,
  fx3StartState,
  normalizeFx3,
  optionsFor,
  type Fx3State,
} from "@/lib/simulators/fx3";

const set = (patch: Partial<Fx3State>) => normalizeFx3({ ...fx3StartState, ...patch });

describe("FX3 simulator settings", () => {
  it("offers the frame rates Sony lists for each format", () => {
    assert.deepEqual(frameRatesFor("XAVC HS 4K", "NTSC"), ["119.88p", "59.94p", "23.98p"]);
    assert.deepEqual(frameRatesFor("XAVC S 4K", "PAL"), ["100p", "50p", "25p"]);
    assert.deepEqual(frameRatesFor("XAVC S-I DCI 4K", "PAL"), ["50p", "25p", "24.00p"]);
  });

  it("moves 23.98p to 25p when switching to PAL", () => {
    const s = set({ fileFormat: "XAVC S 4K", system: "PAL" });
    assert.equal(s.recFrameRate, "25p");
    assert.equal(s.recordSetting, "140M 4:2:2 10bit");
  });

  it("falls back to 50p, not slow motion, for XAVC HS 4K in PAL", () => {
    assert.equal(set({ system: "PAL" }).recFrameRate, "50p");
    assert.equal(set({ system: "PAL", recFrameRate: "119.88p" }).recFrameRate, "100p");
  });

  it("uses the PAL bit rate for XAVC S-I", () => {
    const s = set({ fileFormat: "XAVC S-I 4K", system: "PAL", recFrameRate: "50p" });
    assert.equal(s.recordSetting, "500M 4:2:2 10bit");
  });

  it("keeps the record setting valid after a frame-rate change", () => {
    const s = set({ recFrameRate: "119.88p" });
    assert.deepEqual(optionsFor(fx3Items.recordSetting, s), ["280M 4:2:2 10bit", "200M 4:2:0 10bit"]);
    assert.equal(s.recordSetting, "280M 4:2:2 10bit");
  });

  it("drops SteadyShot Active and slow shutter speeds at 119.88p", () => {
    const s = set({ steadyShot: "Active", recFrameRate: "119.88p", shutterSpeed: "1/50" });
    assert.equal(s.steadyShot, "Standard");
    assert.equal(s.shutterSpeed, "1/125");
    assert.ok(!optionsFor(fx3Items.steadyShot, s).includes("Active"));
  });

  it("limits Exposure Index to ±2 stops of the Base ISO in Cine EI", () => {
    const s = set({ logShooting: "Cine EI", baseIso: "ISO 12800" });
    const eis = optionsFor(fx3Items.exposureIndex, s);
    assert.equal(eis[0], "3200EI");
    assert.equal(eis[eis.length - 1], "51200EI");
    assert.equal(s.exposureIndex, "12800EI");
  });

  it("locks Picture Profile and Gamma Display Assist while Log is on", () => {
    const s = set({ logShooting: "Flexible ISO", gammaAssist: "On" });
    assert.equal(s.gammaAssist, "Off");
    assert.ok(fx3Items.pictureProfile.disabled?.(s, false));
  });
});
