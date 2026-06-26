import {existsSync} from "node:fs";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import type {
  GitHubRepo,
  GitHubSnapshot,
  PortfolioContent,
  Project
} from "./types.js";

type ProfileFile = Pick<PortfolioContent, "profile" | "skills" | "experience">;
type ProjectsFile = {
  projects: Project[];
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function resolveDataDir(explicitDir?: string): string {
  if (explicitDir) {
    return explicitDir;
  }

  if (process.env.TUI_PORTFOLIO_DATA_DIR) {
    return process.env.TUI_PORTFOLIO_DATA_DIR;
  }

  const cwdData = path.join(process.cwd(), "data");
  if (existsSync(cwdData)) {
    return cwdData;
  }

  return path.join(packageRoot, "data");
}

export async function loadPortfolioContent(dataDir = resolveDataDir()): Promise<PortfolioContent> {
  const [profileFile, projectsFile, github] = await Promise.all([
    readJson<ProfileFile>(path.join(dataDir, "profile.json")),
    readJson<ProjectsFile>(path.join(dataDir, "projects.json")),
    readOptionalJson<GitHubSnapshot>(path.join(dataDir, "github.generated.json"), {
      syncedAt: null,
      user: null,
      repos: []
    })
  ]);

  return {
    ...profileFile,
    github,
    projects: mergeProjects(projectsFile.projects, github.repos)
  };
}

export function mergeProjects(curated: Project[], repos: GitHubRepo[]): Project[] {
  const curatedByRepo = new Map(
    curated
      .filter((project) => project.repo)
      .map((project) => [normalizeRepo(project.repo!), project])
  );

  const mergedFromGitHub = repos.map((repo) => {
    const curatedProject = curatedByRepo.get(normalizeRepo(repo.fullName));
    const fallback: Project = {
      id: slug(repo.name),
      repo: repo.fullName,
      name: repo.name,
      description: repo.description || "No repository description yet.",
      stack: [repo.language, ...repo.topics].filter(Boolean) as string[],
      highlights: [],
      featured: false,
      url: repo.url,
      stars: repo.stars,
      forks: repo.forks,
      language: repo.language ?? undefined,
      updatedAt: repo.updatedAt
    };

    return curatedProject ? {...fallback, ...curatedProject} : fallback;
  });

  const reposSeen = new Set(repos.map((repo) => normalizeRepo(repo.fullName)));
  const localOnly = curated.filter((project) => !project.repo || !reposSeen.has(normalizeRepo(project.repo)));

  return [...localOnly, ...mergedFromGitHub].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return (right.stars ?? 0) - (left.stars ?? 0);
  });
}

export function findProject(projects: Project[], token: string): Project | undefined {
  const normalized = token.trim().toLowerCase();
  const asIndex = Number.parseInt(normalized, 10);

  if (!Number.isNaN(asIndex) && asIndex > 0) {
    return projects[asIndex - 1];
  }

  return projects.find((project) => {
    return [
      project.id,
      project.name,
      project.repo,
      project.repo?.split("/").at(-1)
    ]
      .filter(Boolean)
      .some((candidate) => candidate!.toLowerCase() === normalized);
  });
}

function normalizeRepo(repo: string): string {
  return repo.toLowerCase().replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function readOptionalJson<T>(filePath: string, fallback: T): Promise<T> {
  if (!existsSync(filePath)) {
    return fallback;
  }

  return readJson<T>(filePath);
}


