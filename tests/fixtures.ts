import type {PortfolioContent} from "../src/types.js";

export const fixtureContent: PortfolioContent = {
  profile: {
    name: "Ada Dev",
    title: "Systems Builder",
    location: "Terminal City",
    bio: "Builds practical tools with sharp interfaces.",
    links: {
      github: "https://github.com/ada",
      email: "mailto:ada@example.com"
    },
    resume: "https://example.com/ada.pdf"
  },
  skills: [
    {
      group: "Languages",
      items: ["TypeScript", "Rust"]
    }
  ],
  experience: [
    {
      period: "2026",
      role: "Maintainer",
      organization: "Console Works",
      summary: "Ships useful terminal software."
    }
  ],
  projects: [
    {
      id: "console-kit",
      repo: "ada/console-kit",
      name: "console-kit",
      description: "A compact terminal toolkit.",
      stack: ["TypeScript", "Ink"],
      highlights: ["Composable panes"],
      featured: true,
      stars: 42,
      forks: 3,
      url: "https://github.com/ada/console-kit"
    }
  ],
  github: {
    syncedAt: "2026-06-19T00:00:00.000Z",
    user: "ada",
    repos: []
  }
};
