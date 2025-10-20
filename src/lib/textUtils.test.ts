import { stripHtmlTags } from "./textUtils";

describe("stripHtmlTags", () => {
  it("should strip HTML tags and return plain text", () => {
    const html = "<p><strong>Great job</strong></p>";
    const result = stripHtmlTags(html);
    expect(result).toBe("Great job");
  });

  it("should handle multiple HTML tags", () => {
    const html = "<p><strong>Great</strong> <em>job</em> <br>indeed</p>";
    const result = stripHtmlTags(html);
    expect(result).toBe("Great job indeed");
  });

  it("should decode HTML entities", () => {
    const html = "<p>Great &amp; wonderful job</p>";
    const result = stripHtmlTags(html);
    expect(result).toBe("Great & wonderful job");
  });

  it("should normalize whitespace", () => {
    const html = "<p>Great    job</p>";
    const result = stripHtmlTags(html);
    expect(result).toBe("Great job");
  });

  it("should handle empty string", () => {
    const html = "";
    const result = stripHtmlTags(html);
    expect(result).toBe("");
  });

  it("should handle undefined input", () => {
    const result = stripHtmlTags(undefined as unknown as string);
    expect(result).toBe("");
  });
});