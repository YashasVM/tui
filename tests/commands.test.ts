import {describe, expect, it} from "vitest";
import {executeCommand, parseCommand} from "../src/commands.js";
import {fixtureContent} from "./fixtures.js";

describe("parseCommand", () => {
  it("normalizes command aliases", () => {
    expect(parseCommand("?").name).toBe("help");
    expect(parseCommand("ls").name).toBe("projects");
    expect(parseCommand("gh").name).toBe("github");
  });

  it("keeps arguments for project commands", () => {
    expect(parseCommand("open console-kit").args).toEqual(["console-kit"]);
  });
});

describe("executeCommand", () => {
  it("returns a helpful unknown-command response", () => {
    const result = executeCommand("wat", fixtureContent, "amber");
    expect(result.title).toBe("unknown command");
    expect(result.lines?.join("\n")).toContain("command not found");
  });

  it("opens projects by id", () => {
    const result = executeCommand("open console-kit", fixtureContent, "amber");
    expect(result.title).toBe("console-kit");
    expect(result.view).toBe("dossier");
    expect(result.focusProjectId).toBe("console-kit");
    expect(result.lines?.join("\n")).toContain("Composable panes");
  });

  it("opens projects by list number", () => {
    const result = executeCommand("open 1", fixtureContent, "amber");
    expect(result.title).toBe("console-kit");
  });

  it("switches to valid themes", () => {
    const result = executeCommand("theme green", fixtureContent, "amber");
    expect(result.theme).toBe("green");
  });

  it("activates the overdrive view from aliases", () => {
    const result = executeCommand("wow", fixtureContent, "amber");
    expect(result.view).toBe("reactor");
    expect(result.lines?.join("\n")).toContain("portfolio reactor");
  });

  it("renders constellation and radar commands", () => {
    expect(executeCommand("constellation", fixtureContent, "amber").view).toBe("constellation");
    expect(executeCommand("radar", fixtureContent, "amber").lines?.join("\n")).toContain("skill radar");
  });

  it("renders ops and transmission live views", () => {
    expect(executeCommand("ops", fixtureContent, "amber").view).toBe("ops");
    expect(executeCommand("transmit", fixtureContent, "amber").view).toBe("transmission");
  });

  it("warps directly into a project dossier", () => {
    const result = executeCommand("warp 1", fixtureContent, "amber");
    expect(result.view).toBe("dossier");
    expect(result.lines?.join("\n")).toContain("project dossier");
  });

  it("supports expanded theme names", () => {
    const result = executeCommand("theme hotline", fixtureContent, "amber");
    expect(result.theme).toBe("hotline");
  });
});
