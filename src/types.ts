export type LinkMap = {
  github?: string;
  linkedin?: string;
  email?: string;
  website?: string;
  [key: string]: string | undefined;
};

export type Profile = {
  name: string;
  title: string;
  location: string;
  bio: string;
  links: LinkMap;
  resume?: string;
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export type ExperienceItem = {
  period: string;
  role: string;
  organization: string;
  summary: string;
};

export type Project = {
  id: string;
  repo?: string;
  name: string;
  description: string;
  stack: string[];
  highlights: string[];
  featured?: boolean;
  url?: string;
  stars?: number;
  forks?: number;
  language?: string;
  updatedAt?: string;
};

export type GitHubRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  homepage?: string | null;
};

export type GitHubSnapshot = {
  syncedAt: string | null;
  user: string | null;
  repos: GitHubRepo[];
};

export type PortfolioContent = {
  profile: Profile;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  projects: Project[];
  github: GitHubSnapshot;
};

export type ThemeName = "amber" | "green" | "paper";
