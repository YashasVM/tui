import React, {useEffect, useMemo, useState} from "react";
import {Box, Text, useApp, useInput, useStdout} from "ink";
import TextInput from "ink-text-input";
import {executeCommand, type CommandResult} from "./commands.js";
import {
  renderMatrixRain,
  renderProjectConstellation,
  renderReactor,
  renderSignalScope,
  renderSkillRadar,
  renderTimeline,
  type ViewName
} from "./spectacle.js";
import {themes} from "./theme.js";
import type {PortfolioContent, ThemeName} from "./types.js";
import {Frame} from "./components/Frame.js";

type HistoryEntry = {
  input: string;
  result: CommandResult;
};

type AppProps = {
  content: PortfolioContent;
  skipBoot?: boolean;
};

const bootLines = [
  "booting /usr/portfolio/kernel",
  "mounting ./data as read-only signal store",
  "probing github.generated cache",
  "loading command shell",
  "ready"
];

export function App({content, skipBoot = false}: AppProps): React.ReactElement {
  const [themeName, setThemeName] = useState<ThemeName>("amber");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeView, setActiveView] = useState<ViewName>("home");
  const [tick, setTick] = useState(0);
  const [bootComplete, setBootComplete] = useState(skipBoot);
  const [bootIndex, setBootIndex] = useState(skipBoot ? bootLines.length : 0);
  const {exit} = useApp();
  const {stdout} = useStdout();
  const width = Math.max(70, Math.min(stdout?.columns ?? 92, 110));
  const theme = themes[themeName];

  useEffect(() => {
    if (skipBoot || bootComplete) {
      return;
    }

    if (bootIndex >= bootLines.length) {
      const doneTimer = setTimeout(() => setBootComplete(true), 250);
      return () => clearTimeout(doneTimer);
    }

    const timer = setTimeout(() => setBootIndex((value) => value + 1), 170);
    return () => clearTimeout(timer);
  }, [bootComplete, bootIndex, skipBoot]);

  useInput((_, key) => {
    if (key.escape) {
      exit();
    }
  });

  useEffect(() => {
    if (!bootComplete) {
      return;
    }

    const timer = setInterval(() => setTick((value) => value + 1), 180);
    return () => clearInterval(timer);
  }, [bootComplete]);

  const featured = useMemo(() => content.projects.filter((project) => project.featured).slice(0, 3), [content.projects]);

  function submit(commandText: string): void {
    const result = executeCommand(commandText, content, themeName);

    if (result.theme) {
      setThemeName(result.theme);
    }

    if (result.view) {
      setActiveView(result.view);
    }

    if (result.clear) {
      setHistory([]);
      setInput("");
      setActiveView("home");
      return;
    }

    setHistory((entries) => [...entries, {input: commandText, result}]);
    setInput("");

    if (result.exit) {
      setTimeout(() => exit(), 100);
    }
  }

  return (
    <Box width={width} flexDirection="column">
      <Frame title="tui-portfolio // retro unix developer console" theme={theme}>
        {!bootComplete ? (
          <BootScreen themeName={themeName} bootIndex={bootIndex} />
        ) : (
          <Box flexDirection="column">
            <Header content={content} themeName={themeName} />
            <Box marginY={1}>
              <Text color={theme.muted}>type </Text>
              <Text color={theme.accent}>help</Text>
              <Text color={theme.muted}> or </Text>
              <Text color={theme.accent}>launch</Text>
              <Text color={theme.muted}>. try </Text>
              <Text color={theme.accent}>constellation</Text>
              <Text color={theme.muted}>, </Text>
              <Text color={theme.accent}>radar</Text>
              <Text color={theme.muted}>, </Text>
              <Text color={theme.accent}>matrix</Text>
              <Text color={theme.muted}>. </Text>
              <Text color={theme.accent}>esc</Text>
              <Text color={theme.muted}> to quit.</Text>
            </Box>
            <LiveDeck content={content} themeName={themeName} activeView={activeView} tick={tick} />
            <FeaturedProjects items={featured} themeName={themeName} />
            <History entries={history} themeName={themeName} />
            <Prompt input={input} onChange={setInput} onSubmit={submit} themeName={themeName} />
          </Box>
        )}
      </Frame>
      <StatusBar content={content} themeName={themeName} />
    </Box>
  );
}

function BootScreen({themeName, bootIndex}: {themeName: ThemeName; bootIndex: number}): React.ReactElement {
  const theme = themes[themeName];
  return (
    <Box flexDirection="column">
      <Text color={theme.accent}>TUI PORTFOLIO BIOS v0.1</Text>
      <Text color={theme.muted}>----------------------------------------</Text>
      {bootLines.slice(0, bootIndex).map((line) => (
        <Text key={line} color={theme.foreground}>
          [ ok ] {line}
        </Text>
      ))}
      {bootIndex < bootLines.length ? <Text color={theme.muted}>[ .. ] {bootLines[bootIndex]}</Text> : null}
    </Box>
  );
}

function Header({content, themeName}: {content: PortfolioContent; themeName: ThemeName}): React.ReactElement {
  const theme = themes[themeName];
  return (
    <Box flexDirection="column">
      <Text color={theme.accent}>
        {content.profile.name} / {content.profile.title}
      </Text>
      <Text color={theme.muted}>
        {content.profile.location} :: {content.projects.length} projects :: {content.skills.length} skill groups
      </Text>
    </Box>
  );
}

function FeaturedProjects({items, themeName}: {items: PortfolioContent["projects"]; themeName: ThemeName}): React.ReactElement | null {
  const theme = themes[themeName];
  if (items.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={theme.muted}>featured:</Text>
      {items.map((project) => (
        <Text key={project.id} color={theme.foreground}>
          * {project.id.padEnd(18)} {project.description}
        </Text>
      ))}
    </Box>
  );
}

function LiveDeck({
  content,
  themeName,
  activeView,
  tick
}: {
  content: PortfolioContent;
  themeName: ThemeName;
  activeView: ViewName;
  tick: number;
}): React.ReactElement {
  const theme = themes[themeName];
  const lines = activeViewLines(content, activeView, tick);

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={theme.muted}>view:{activeView} tick:{String(tick % 1000).padStart(3, "0")}</Text>
      {lines.map((line, index) => (
        <Text key={`${activeView}-${index}-${line}`} color={index === 0 ? theme.accent : theme.foreground}>
          {line || " "}
        </Text>
      ))}
    </Box>
  );
}

function activeViewLines(content: PortfolioContent, activeView: ViewName, tick: number): string[] {
  switch (activeView) {
    case "constellation":
      return renderProjectConstellation(content.projects, tick);
    case "radar":
      return renderSkillRadar(content.skills, tick);
    case "timeline":
      return renderTimeline(content);
    case "reactor":
      return renderReactor(content, tick);
    case "matrix":
      return renderMatrixRain(content, tick);
    case "home":
    default:
      return [
        " _______  _   _  _____",
        "|__   __|| | | ||_   _|",
        "   | |   | | | |  | |",
        "   | |   | |_| | _| |_",
        "   |_|    \\___/ |_____|",
        "",
        "terminal portfolio: armed, awake, allergic to boring resumes",
        "",
        ...renderSignalScope(tick),
        "",
        "hot keys: launch | constellation | radar | matrix | demo | theme hotline"
      ];
  }
}

function History({entries, themeName}: {entries: HistoryEntry[]; themeName: ThemeName}): React.ReactElement {
  const theme = themes[themeName];
  const visibleEntries = entries.slice(-6);

  return (
    <Box flexDirection="column">
      {visibleEntries.map((entry, index) => (
        <Box key={`${entry.input}-${index}`} flexDirection="column" marginBottom={1}>
          <Text color={theme.accent}>$ {entry.input}</Text>
          {entry.result.title ? <Text color={theme.muted}>== {entry.result.title} ==</Text> : null}
          {(entry.result.lines ?? []).map((line, lineIndex) => (
            <Text key={`${entry.input}-${lineIndex}`} color={line.includes("not found") ? theme.danger : theme.foreground}>
              {line || " "}
            </Text>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function Prompt({
  input,
  onChange,
  onSubmit,
  themeName
}: {
  input: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  themeName: ThemeName;
}): React.ReactElement {
  const theme = themes[themeName];
  return (
    <Box>
      <Text color={theme.accent}>$ </Text>
      <TextInput value={input} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
}

function StatusBar({content, themeName}: {content: PortfolioContent; themeName: ThemeName}): React.ReactElement {
  const theme = themes[themeName];
  const sync = content.github.syncedAt ? `synced ${content.github.syncedAt.slice(0, 10)}` : "github cache empty";
  return (
    <Box paddingX={1}>
      <Text color={theme.muted}>
        theme:{themeName} | {sync} | data:local json | shell:interactive
      </Text>
    </Box>
  );
}
