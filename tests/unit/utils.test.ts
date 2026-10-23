import { describe, it, expect } from "vitest";
import {
  slugify,
  formatDate,
  estimateReadingTime,
  formatFileSize,
  formatDuration,
  truncate,
  generateFileName,
} from "@/lib/utils";

describe("slugify", () => {
  it("converts text to URL-safe slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("My Favorite Portraits")).toBe("my-favorite-portraits");
    expect(slugify("  Spaced  Out  ")).toBe("spaced-out");
  });

  it("removes special characters", () => {
    expect(slugify("Night Stories!")).toBe("night-stories");
    expect(slugify("Black & White")).toBe("black-white");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-10-23T00:00:00Z");
    expect(result).toBeTruthy();
    expect(result).toContain("2026");
  });

  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("returns empty string for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("estimateReadingTime", () => {
  it("returns at least 1 minute", () => {
    expect(estimateReadingTime("short")).toBe(1);
  });

  it("estimates longer text", () => {
    const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
    expect(estimateReadingTime(words)).toBe(2);
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
  });
});

describe("formatDuration", () => {
  it("formats seconds to mm:ss", () => {
    expect(formatDuration(0)).toBe("");
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(3661)).toBe("1:01:01");
  });
});

describe("truncate", () => {
  it("truncates long text", () => {
    const result = truncate("This is a very long text", 10);
    expect(result.length).toBeLessThanOrEqual(11);
    expect(result).toContain("…");
  });

  it("returns short text unchanged", () => {
    expect(truncate("short", 10)).toBe("short");
  });
});

describe("generateFileName", () => {
  it("generates unique file name", () => {
    const name1 = generateFileName("photo.jpg");
    const name2 = generateFileName("photo.jpg");
    expect(name1).not.toBe(name2);
    expect(name1).toContain(".jpg");
  });
});
