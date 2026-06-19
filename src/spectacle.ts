import type {PortfolioContent, Project, SkillGroup} from "./types.js";

export type ViewName = "home" | "constellation" | "radar" | "timeline" | "reactor" | "matrix";

const pulseChars = [".", ":", "*", "#", "*", ":"];
const rainGlyphs = "01TUI$#\\/[]{}<>+=-*";

export function renderSignalScope(tick: number, width = 56): string[] {
  const bodyWidth = Math.max(18, width - 2);
  const rows = [0, 1, 2].map((row) => {
    let line = "";
    for (let index = 0; index < bodyWidth; index += 1) {
      const phase = (index + tick + row * 7) % 18;
      const pulse = (index * (row + 3) + tick) % 29 === 0;
      line += pulse ? "#" : phase < 3 ? "*" : phase < 7 ? "~" : phase < 11 ? "-" : ".";
    }

    return `|${line}|`;
  });

  return ["signal scope", ...rows];
}

export function renderProjectConstellation(projects: Project[], tick = 0, width = 58): string[] {
  const usableWidth = Math.max(30, width);
  const featured = projects.slice(0, 6);

  if (featured.length === 0) {
    return ["project constellation", "no project nodes loaded"];
  }

  const lines = ["project constellation"];
  featured.forEach((project, index) => {
    const orbit = ".".repeat((index * 5 + tick) % 17);
    const connector = "-".repeat(Math.max(2, 14 - index));
    const name = project.id.slice(0, 22).padEnd(22);
    const signal = pulseChars[(tick + index) % pulseChars.length];
    const stars = project.stars === undefined ? "--" : String(project.stars).padStart(2, "0");
    lines.push(`${orbit}${signal}[${String(index + 1).padStart(2, "0")}]${connector}${name} stars:${stars}`.slice(0, usableWidth));
  });

  lines.push("hint: open <node>  |  scan  |  radar");
  return lines;
}

export function renderSkillRadar(groups: SkillGroup[], tick = 0): string[] {
  const lines = ["skill radar"];

  groups.forEach((group, index) => {
    const power = Math.min(24, Math.max(5, group.items.length * 4 + index * 2));
    const sweep = (tick + index * 3) % 8;
    const bar = "#".repeat(power) + ".".repeat(24 - power);
    const label = group.group.slice(0, 12).padEnd(12);
    lines.push(`${label} [${bar}] ${group.items.join(" / ")}`);
    if (sweep === 0) {
      lines.push("             sweep lock: high-signal cluster detected");
    }
  });

  return lines;
}

export function renderTimeline(content: PortfolioContent): string[] {
  const lines = ["timeline tape"];
  content.experience.forEach((item, index) => {
    const rail = index === content.experience.length - 1 ? "`-" : "|-";
    lines.push(`${rail} ${item.period} :: ${item.role} @ ${item.organization}`);
    lines.push(`   ${item.summary}`);
  });

  return lines;
}

export function renderReactor(content: PortfolioContent, tick = 0): string[] {
  const projectScore = Math.min(100, content.projects.length * 14 + content.github.repos.length * 3);
  const skillScore = Math.min(100, content.skills.reduce((sum, group) => sum + group.items.length, 0) * 9);
  const linkScore = Math.min(100, Object.values(content.profile.links).filter(Boolean).length * 22);
  const motionScore = 88 + (tick % 9);

  return [
    "portfolio reactor",
    meter("projects", projectScore, tick),
    meter("skills", skillScore, tick + 2),
    meter("links", linkScore, tick + 4),
    meter("motion", motionScore, tick + 6),
    "",
    "status: overdrive available",
    "run: constellation | radar | matrix | demo"
  ];
}

export function renderMatrixRain(content: PortfolioContent, tick = 0, width = 58): string[] {
  const words = [
    content.profile.name,
    content.profile.title,
    ...content.projects.map((project) => project.id),
    ...content.skills.flatMap((group) => group.items)
  ]
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const seed = words || rainGlyphs;
  const rows = ["matrix tape"];

  for (let row = 0; row < 6; row += 1) {
    let line = "";
    for (let column = 0; column < width; column += 1) {
      const index = (row * 11 + column * 7 + tick) % (seed.length + rainGlyphs.length);
      const source = index < seed.length ? seed : rainGlyphs;
      line += source[index % source.length];
    }
    rows.push(line);
  }

  return rows;
}

export function renderSystemScan(content: PortfolioContent): string[] {
  const featured = content.projects.filter((project) => project.featured).length;
  const stack = [...new Set(content.projects.flatMap((project) => project.stack))].filter(Boolean);
  const links = Object.entries(content.profile.links).filter(([, value]) => Boolean(value));

  return [
    "deep scan",
    `identity       ${content.profile.name} / ${content.profile.title}`,
    `projects       ${content.projects.length} loaded (${featured} featured)`,
    `github cache   ${content.github.user ?? "none"} / ${content.github.repos.length} repos`,
    `stack cloud    ${stack.slice(0, 10).join(" / ") || "add project stack tags"}`,
    `links armed    ${links.map(([name]) => name).join(" / ") || "none"}`,
    "",
    "verdict        portfolio shell is operational; content wants your real work next"
  ];
}

export function renderDemoScript(): string[] {
  return [
    "guided detonation",
    "1. about          -> identity card",
    "2. constellation  -> project orbit map",
    "3. radar          -> skill sweep",
    "4. open 1         -> inspect the first project node",
    "5. matrix         -> animated data tape",
    "6. theme hotline  -> flip into neon terminal overdrive"
  ];
}

function meter(label: string, value: number, tick: number): string {
  const slots = 24;
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * slots);
  const sparkle = tick % Math.max(1, filled || 1);
  let bar = "";

  for (let index = 0; index < slots; index += 1) {
    if (index >= filled) {
      bar += ".";
    } else {
      bar += index === sparkle ? "*" : "#";
    }
  }

  return `${label.padEnd(9)} [${bar}] ${String(value).padStart(3)}%`;
}
