import {describe, expect, it} from "vitest";
import {findProject, mergeProjects} from "../src/content.js";
import type {GitHubRepo, Project} from "../src/types.js";

describe("mergeProjects", () => {
  it("lets curated project fields override GitHub snapshot fields", () => {
    const curated: Project[] = [
      {
        id: "hand-picked",
        repo: "ada/tool",
        name: "Better Name",
        description: "Curated description",
        stack: ["TypeScript"],
        highlights: ["Curated highlight"],
        featured: true
      }
    ];

    const repos: GitHubRepo[] = [
      {
        id: 1,
        name: "tool",
        fullName: "ada/tool",
        description: "GitHub description",
        url: "https://github.com/ada/tool",
        stars: 10,
        forks: 2,
        language: "JavaScript",
        topics: ["cli"],
        updatedAt: "2026-06-19T00:00:00Z"
      }
    ];

    const [merged] = mergeProjects(curated, repos);
    expect(merged.id).toBe("hand-picked");
    expect(merged.description).toBe("Curated description");
    expect(merged.stars).toBe(10);
    expect(merged.url).toBe("https://github.com/ada/tool");
  });

  it("finds projects by index, id, and repo name", () => {
    const projects = mergeProjects([], [
      {
        id: 1,
        name: "tool",
        fullName: "ada/tool",
        description: "",
        url: "https://github.com/ada/tool",
        stars: 0,
        forks: 0,
        language: null,
        topics: [],
        updatedAt: "2026-06-19T00:00:00Z"
      }
    ]);

    expect(findProject(projects, "1")?.name).toBe("tool");
    expect(findProject(projects, "tool")?.name).toBe("tool");
    expect(findProject(projects, "ada/tool")?.name).toBe("tool");
  });
});
