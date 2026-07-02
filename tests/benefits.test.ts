import { describe, it, expect } from "vitest";
import { BENEFITS, BENEFITS_DISCLAIMER } from "../lib/benefits";

// Guards the NAFDAC/health-claim risk flagged in the brief and design: benefit
// copy must stay non-medical and never instruct wound application.
const BANNED = ["cure", "treat", "no side effect", "wound", "heals", "disease"];

describe("benefit claims safety", () => {
  it("carries a not-medical-advice disclaimer", () => {
    expect(BENEFITS_DISCLAIMER.toLowerCase()).toContain("not medical advice");
  });

  it("contains no medical / forbidden claims", () => {
    for (const b of BENEFITS) {
      const text = `${b.title} ${b.blurb} ${b.howToUse}`.toLowerCase();
      for (const word of BANNED) {
        expect(text, `"${word}" found in benefit ${b.letter}`).not.toContain(word);
      }
    }
  });

  it("every benefit explains how to use it", () => {
    for (const b of BENEFITS) {
      expect(b.howToUse.length).toBeGreaterThan(0);
    }
  });
});
