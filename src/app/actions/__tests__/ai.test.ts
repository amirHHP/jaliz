import { describe, it, expect } from "vitest";
import { parseJsonFromModelText } from "../ai";

describe("parseJsonFromModelText", () => {
  it("should parse standard valid JSON", () => {
    const raw = `{\n  "name": "Zamioculcas",\n  "type": "Indoor"\n}`;
    const result = parseJsonFromModelText(raw);
    expect(result).toEqual({ name: "Zamioculcas", type: "Indoor" });
  });

  it("should parse fenced markdown code blocks", () => {
    const raw = `Some conversational text here...\n\`\`\`json\n{\n  "name": "Zamioculcas",\n  "type": "Indoor"\n}\n\`\`\`\nAnd more text.`;
    const result = parseJsonFromModelText(raw);
    expect(result).toEqual({ name: "Zamioculcas", type: "Indoor" });
  });

  it("should clean trailing commas and parse successfully", () => {
    const raw = `{\n  "name": "Zamioculcas",\n  "type": "Indoor",\n}`;
    const result = parseJsonFromModelText(raw);
    expect(result).toEqual({ name: "Zamioculcas", type: "Indoor" });
  });

  it("should extract the correct JSON block when thinking blocks contain curly braces", () => {
    const raw = `<think>\nLet's think: the schema is {"type": "something"} or similar.\n</think>\n{\n  "name": "Zamioculcas",\n  "type": "Indoor"\n}`;
    const result = parseJsonFromModelText(raw);
    expect(result).toEqual({ name: "Zamioculcas", type: "Indoor" });
  });

  it("should throw an error for completely invalid JSON", () => {
    const raw = `This is just general conversation text without any JSON.`;
    expect(() => parseJsonFromModelText(raw)).toThrow("Could not extract valid JSON");
  });
});
