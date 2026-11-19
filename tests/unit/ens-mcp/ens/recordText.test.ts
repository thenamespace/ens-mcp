import { describe, expect, it } from "@effect/vitest";
import { String as Str } from "effect";

import { cleanRecordText } from "@thenamespace/ens-mcp/internal/ens/recordText";

describe("cleanRecordText", () => {
  it("strips characters that hide or reorder text and keeps emoji sequences", () => {
    expect(cleanRecordText("pay\u202Egnp.exe\u0007\nme")).toBe("paygnp.exe\nme");
    expect(cleanRecordText("👩‍💻")).toBe("👩‍💻");
  });

  it("cuts long values with a visible marker", () => {
    expect(cleanRecordText(Str.repeat(5000)("a"))).toBe(`${Str.repeat(2000)("a")}… [truncated]`);
  });
});
