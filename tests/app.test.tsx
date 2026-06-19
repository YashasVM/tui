import React from "react";
import {describe, expect, it} from "vitest";
import {render} from "ink-testing-library";
import {App} from "../src/app.js";
import {fixtureContent} from "./fixtures.js";

describe("App", () => {
  it("renders the shell header without the boot delay", () => {
    const {lastFrame} = render(<App content={fixtureContent} skipBoot />);
    expect(lastFrame()).toContain("tui-portfolio");
    expect(lastFrame()).toContain("Ada Dev / Systems Builder");
    expect(lastFrame()).toContain("view:home");
    expect(lastFrame()).toContain("terminal portfolio");
    expect(lastFrame()).toContain("cinema");
    expect(lastFrame()).toContain("featured:");
  });
});
