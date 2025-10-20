import { generateSlug } from "./utils";

describe("generateSlug", () => {
  test("should generate a basic slug from title", () => {
    expect(generateSlug("Software Engineer")).toBe("software-engineer");
  });

  test("should handle special characters", () => {
    expect(generateSlug("Senior Software Engineer (Remote)")).toBe("senior-software-engineer-remote");
  });

  test("should handle multiple spaces", () => {
    expect(generateSlug("Product   Manager")).toBe("product-manager");
  });

  test("should handle hyphens", () => {
    expect(generateSlug("Front-end Developer")).toBe("front-end-developer");
  });

  test("should handle underscores", () => {
    expect(generateSlug("Data_Scientist")).toBe("data-scientist");
  });

  test("should include company name", () => {
    expect(generateSlug("Marketing Manager", "Google")).toBe("marketing-manager-google");
  });

  test("should handle empty inputs", () => {
    expect(generateSlug("")).toBe("");
    expect(generateSlug("   ")).toBe("");
  });

  test("should handle company with spaces", () => {
    expect(generateSlug("Product Manager", "ABC Company")).toBe("product-manager-abc");
  });
});