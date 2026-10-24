import { describe, expect, it } from "vitest";
import { formatCertificateDate } from "@/lib/date";

describe("formatCertificateDate", () => {
  it("formats an ISO date as DD/MM/YYYY", () => {
    expect(formatCertificateDate("2026-07-13")).toBe("13/07/2026");
  });

  it("returns an empty string for an unset date input", () => {
    expect(formatCertificateDate("")).toBe("");
  });

  it("rejects anything that is not exactly YYYY-MM-DD", () => {
    expect(formatCertificateDate("13/07/2026")).toBe("");
    expect(formatCertificateDate("20266-01-01")).toBe("");
  });
});
