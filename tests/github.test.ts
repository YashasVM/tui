import {mkdtemp, readFile, rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchPublicRepos, syncGitHubSnapshot} from "../src/github.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, {recursive: true, force: true})));
  tempDirs.length = 0;
});

describe("fetchPublicRepos", () => {
  it("filters forks and archived repositories", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify([
          repo({name: "keep", fork: false, archived: false}),
          repo({name: "forked", fork: true, archived: false}),
          repo({name: "old", fork: false, archived: true})
        ]),
        {status: 200}
      )
    );

    const snapshot = await fetchPublicRepos("ada", fetcher as typeof fetch);
    expect(snapshot.repos.map((item) => item.name)).toEqual(["keep"]);
  });

  it("throws useful rate-limit errors", async () => {
    const fetcher = vi.fn(async () => new Response("nope", {status: 403, statusText: "Forbidden"}));
    await expect(fetchPublicRepos("ada", fetcher as typeof fetch)).rejects.toThrow("rate limit");
  });
});

describe("syncGitHubSnapshot", () => {
  it("writes github.generated.json", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "tui-portfolio-"));
    tempDirs.push(dir);

    const fetcher = vi.fn(async () => new Response(JSON.stringify([repo({name: "keep"})]), {status: 200}));
    const snapshot = await syncGitHubSnapshot({user: "ada", dataDir: dir, fetcher: fetcher as typeof fetch});
    const saved = JSON.parse(await readFile(path.join(dir, "github.generated.json"), "utf8"));

    expect(snapshot.repos).toHaveLength(1);
    expect(saved.user).toBe("ada");
    expect(saved.repos[0].fullName).toBe("ada/keep");
  });
});

function repo(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  const name = String(overrides.name ?? "repo");
  return {
    id: 1,
    name,
    full_name: `ada/${name}`,
    description: "Test repository",
    html_url: `https://github.com/ada/${name}`,
    stargazers_count: 5,
    forks_count: 1,
    language: "TypeScript",
    topics: ["cli"],
    updated_at: "2026-06-19T00:00:00Z",
    homepage: null,
    fork: false,
    archived: false,
    ...overrides
  };
}
