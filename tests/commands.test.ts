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
});
