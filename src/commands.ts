import {findProject} from "./content.js";
import {
  renderDemoScript,
  renderBossCard,
  renderCinemaSlate,
  renderMatrixRain,
  renderOpsGrid,
  renderProjectDossier,
  renderProjectConstellation,
  renderReactor,
  renderSignalScope,
  renderSkillRadar,
  renderSystemScan,
  renderTransmission,
  renderTimeline,
  type ViewName
} from "./spectacle.js";
import type {PortfolioContent, Project, ThemeName} from "./types.js";

export type ParsedCommand = {
  raw: string;
  name: string;
  args: string[];
};

export type CommandResult = {
  title?: string;
  lines?: string[];
  clear?: boolean;
  exit?: boolean;
  theme?: ThemeName;
  view?: ViewName;
  focusProjectId?: string;
  cinema?: boolean;
};

export function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();
  const [name = "", ...args] = raw.split(/\s+/);
  return {
    raw,
    name: normalizeCommandName(name.toLowerCase()),
    args
  };
}

export function executeCommand(
  input: string,
  content: PortfolioContent,
  currentTheme: ThemeName
): CommandResult {
  const command = parseCommand(input);

  if (!command.raw) {
    return {lines: []};
  }

  switch (command.name) {
    case "help":
      return help();
    case "about":
      return about(content);
    case "projects":
      return projects(content.projects);
    case "open":
      return openProject(command.args, content.projects);
    case "warp":
      return openProject(command.args, content.projects);
    case "skills":
      return skills(content);
    case "github":
      return github(content);
    case "contact":
      return contact(content);
    case "resume":
      return resume(content);
    case "constellation":
      return constellation(content);
    case "radar":
      return radar(content);
    case "timeline":
      return timeline(content);
    case "scan":
      return scan(content);
    case "launch":
      return launch(content);
    case "matrix":
      return matrix(content);
    case "ops":
      return ops(content);
    case "transmit":
      return transmit(content);
    case "boss":
      return boss(content);
    case "cinema":
      return cinema(content);
    case "stop":
      return stop();
    case "demo":
      return demo();
    case "theme":
      return theme(command.args, currentTheme);
    case "clear":
      return {clear: true};
    case "exit":
      return {exit: true, lines: ["session closed."]};
    default:
      return {
        title: "unknown command",
        lines: [`${command.name}: command not found`, "type 'help' to list available commands."]
      };
  }
}

function normalizeCommandName(name: string): string {
  const aliases: Record<string, string> = {
    "?": "help",
    h: "help",
    ls: "projects",
    repos: "projects",
    map: "constellation",
    orbit: "constellation",
    stars: "constellation",
    wow: "launch",
    overdrive: "launch",
    blastoff: "launch",
    rain: "matrix",
    status: "ops",
    mission: "ops",
    contactme: "transmit",
    signal: "transmit",
    poster: "boss",
    flex: "boss",
    finalform: "boss",
    show: "cinema",
    showtime: "cinema",
    autoplay: "cinema",
    time: "timeline",
    repo: "github",
    gh: "github",
    me: "about",
    quit: "exit",
    q: "exit",
    cls: "clear"
  };

  return aliases[name] ?? name;
}

function help(): CommandResult {
  return {
    title: "help",
    lines: [
      "help              show this command index",
      "about             print profile summary",
      "projects          list curated and synced GitHub projects",
      "open <id|#>       inspect a project by id, repo name, or list number",
      "warp <id|#>       lock a project dossier into the live deck",
      "skills            list technical skill groups",
      "github            show synced GitHub snapshot status",
      "contact           show contact links",
      "resume            show resume link",
      "constellation     render the project orbit map",
      "radar             sweep skill clusters",
      "timeline          play the experience tape",
      "scan              run a portfolio systems scan",
      "launch            enter overdrive dashboard mode",
      "matrix            render animated data rain",
      "ops               show a live operations grid",
      "transmit          open contact transmission array",
      "boss              render the terminal poster card",
      "cinema            autoplay a rotating portfolio showreel",
      "stop              stop cinema autoplay",
      "demo              print a guided command sequence",
      "theme [name]      list or switch themes: amber, green, paper, cyan, hotline",
      "clear             clear command history",
      "exit              close the terminal UI"
    ]
  };
}

function about(content: PortfolioContent): CommandResult {
  const {profile, experience} = content;
  return {
    title: `${profile.name} :: ${profile.title}`,
    lines: [
      `location: ${profile.location}`,
      "",
      profile.bio,
      "",
      "recent signal:",
      ...experience.map((item) => `${item.period} / ${item.role} @ ${item.organization} - ${item.summary}`)
    ]
  };
}

function projects(allProjects: Project[]): CommandResult {
  if (allProjects.length === 0) {
    return {
      title: "projects",
      lines: ["no projects found. add data/projects.json entries or run sync."]
    };
  }

  return {
    title: "projects",
    lines: allProjects.map((project, index) => {
      const marker = project.featured ? "*" : " ";
      const stars = project.stars === undefined ? "--" : String(project.stars).padStart(2, " ");
      const stack = project.stack.slice(0, 3).join(", ") || project.language || "misc";
      return `${String(index + 1).padStart(2, "0")} ${marker} ${project.id.padEnd(18)} ${stars} stars  ${stack}`;
    })
  };
}

function openProject(args: string[], allProjects: Project[]): CommandResult {
  const token = args.join(" ");
  if (!token) {
    return {
      title: "open",
      lines: ["usage: open <project-id|repo-name|number>"]
    };
  }

  const project = findProject(allProjects, token);
  if (!project) {
    return {
      title: "open",
      lines: [`project '${token}' was not found.`, "run 'projects' for available ids."]
    };
  }

  return {
    title: project.name,
    view: "dossier",
    focusProjectId: project.id,
    lines: [
      ...renderProjectDossier(project, 0),
      "",
      project.description,
      "",
      `repo: ${project.repo ?? "local-only"}`,
      `url: ${project.url ?? "not set"}`,
      `stack: ${project.stack.join(", ") || "not set"}`,
      `stars: ${project.stars ?? "--"}  forks: ${project.forks ?? "--"}`,
      "",
      "highlights:",
      ...(project.highlights.length > 0 ? project.highlights.map((item) => `- ${item}`) : ["- add highlights in data/projects.json"])
    ]
  };
}

function skills(content: PortfolioContent): CommandResult {
  return {
    title: "skills",
    lines: content.skills.map((group) => `${group.group.padEnd(12)} ${group.items.join(" / ")}`)
  };
}

function github(content: PortfolioContent): CommandResult {
  const {github: snapshot, profile} = content;
  return {
    title: "github",
    lines: [
      `profile: ${profile.links.github ?? "not set"}`,
      `synced user: ${snapshot.user ?? "none"}`,
      `synced at: ${snapshot.syncedAt ?? "never"}`,
      `repos cached: ${snapshot.repos.length}`,
      "",
      "run: tui-portfolio sync --user <github-username>"
    ]
  };
}

function contact(content: PortfolioContent): CommandResult {
  const entries = Object.entries(content.profile.links).filter(([, value]) => Boolean(value));
  return {
    title: "contact",
    lines: entries.map(([name, value]) => `${name.padEnd(10)} ${value}`)
  };
}

function resume(content: PortfolioContent): CommandResult {
  return {
    title: "resume",
    lines: [content.profile.resume ? `resume: ${content.profile.resume}` : "resume link not set in data/profile.json"]
  };
}

function constellation(content: PortfolioContent): CommandResult {
  return {
    title: "constellation",
    view: "constellation",
    lines: renderProjectConstellation(content.projects, 0)
  };
}

function radar(content: PortfolioContent): CommandResult {
  return {
    title: "radar",
    view: "radar",
    lines: renderSkillRadar(content.skills, 0)
  };
}

function timeline(content: PortfolioContent): CommandResult {
  return {
    title: "timeline",
    view: "timeline",
    lines: renderTimeline(content)
  };
}

function scan(content: PortfolioContent): CommandResult {
  return {
    title: "scan",
    lines: renderSystemScan(content)
  };
}

function launch(content: PortfolioContent): CommandResult {
  return {
    title: "overdrive",
    view: "reactor",
    lines: [
      ...renderSignalScope(0),
      "",
      ...renderReactor(content, 0),
      "",
      "overdrive dashboard is now live."
    ]
  };
}

function matrix(content: PortfolioContent): CommandResult {
  return {
    title: "matrix",
    view: "matrix",
    lines: renderMatrixRain(content, 0)
  };
}

function ops(content: PortfolioContent): CommandResult {
  return {
    title: "ops",
    view: "ops",
    lines: renderOpsGrid(content, 0)
  };
}

function transmit(content: PortfolioContent): CommandResult {
  return {
    title: "transmission",
    view: "transmission",
    lines: renderTransmission(content, 0)
  };
}

function boss(content: PortfolioContent): CommandResult {
  return {
    title: "boss",
    view: "boss",
    lines: renderBossCard(content, 0)
  };
}

function cinema(content: PortfolioContent): CommandResult {
  return {
    title: "cinema",
    view: "cinema",
    cinema: true,
    theme: "hotline",
    lines: renderCinemaSlate(content, 0)
  };
}

function stop(): CommandResult {
  return {
    title: "stop",
    view: "home",
    cinema: false,
    lines: ["cinema autoplay stopped.", "manual control restored."]
  };
}

function demo(): CommandResult {
  return {
    title: "demo",
    lines: renderDemoScript()
  };
}

function theme(args: string[], currentTheme: ThemeName): CommandResult {
  const requested = args[0] as ThemeName | undefined;
  const themes: ThemeName[] = ["amber", "green", "paper", "cyan", "hotline"];

  if (!requested) {
    return {
      title: "theme",
      lines: [`active: ${currentTheme}`, `available: ${themes.join(", ")}`]
    };
  }

  if (!themes.includes(requested)) {
    return {
      title: "theme",
      lines: [`unknown theme '${requested}'. available: ${themes.join(", ")}`]
    };
  }

  return {
    theme: requested,
    title: "theme",
    lines: [`theme switched to ${requested}`]
  };
}
