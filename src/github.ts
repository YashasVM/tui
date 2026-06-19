import {writeFile} from "node:fs/promises";
import path from "node:path";
import type {GitHubRepo, GitHubSnapshot} from "./types.js";

type FetchLike = typeof fetch;

type RawGitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  homepage?: string | null;
  fork: boolean;
  archived: boolean;
};

export async function syncGitHubSnapshot(options: {
  user: string;
  dataDir: string;
  fetcher?: FetchLike;
}): Promise<GitHubSnapshot> {
  const snapshot = await fetchPublicRepos(options.user, options.fetcher ?? fetch);
  const outPath = path.join(options.dataDir, "github.generated.json");
  await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

export async function fetchPublicRepos(user: string, fetcher: FetchLike = fetch): Promise<GitHubSnapshot> {
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const url = new URL(`https://api.github.com/users/${encodeURIComponent(user)}/repos`);
    url.searchParams.set("sort", "updated");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));

    const response = await fetcher(url, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "tui-portfolio"
      }
    });

    if (!response.ok) {
      throw new Error(formatGitHubError(response.status, response.statusText));
    }

    const batch = (await response.json()) as RawGitHubRepo[];
    repos.push(...batch.filter(isPortfolioRepo).map(toSnapshotRepo));

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return {
    syncedAt: new Date().toISOString(),
    user,
    repos
  };
}

function isPortfolioRepo(repo: RawGitHubRepo): boolean {
  return !repo.fork && !repo.archived;
}

function toSnapshotRepo(repo: RawGitHubRepo): GitHubRepo {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? "",
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    topics: repo.topics ?? [],
    updatedAt: repo.updated_at,
    homepage: repo.homepage
  };
}

function formatGitHubError(status: number, statusText: string): string {
  if (status === 403) {
    return "GitHub API rate limit or access error. Try again later, or set a smaller public profile first.";
  }

  if (status === 404) {
    return "GitHub user was not found.";
  }

  return `GitHub API request failed: ${status} ${statusText}`;
}
