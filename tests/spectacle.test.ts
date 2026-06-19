import {describe, expect, it} from "vitest";
import {
  renderMatrixRain,
  renderProjectConstellation,
  renderReactor,
  renderSignalScope,
  renderSkillRadar,
  renderSystemScan
} from "../src/spectacle.js";
import {fixtureContent} from "./fixtures.js";

describe("spectacle renderers", () => {
  it("renders animated terminal panels from content", () => {
    expect(renderSignalScope(1).join("\n")).toContain("signal scope");
    expect(renderProjectConstellation(fixtureContent.projects, 1).join("\n")).toContain("console-kit");
    expect(renderSkillRadar(fixtureContent.skills, 1).join("\n")).toContain("Languages");
    expect(renderReactor(fixtureContent, 1).join("\n")).toContain("portfolio reactor");
    expect(renderMatrixRain(fixtureContent, 1)).toHaveLength(7);
  });

  it("summarizes portfolio readiness", () => {
    const scan = renderSystemScan(fixtureContent).join("\n");
    expect(scan).toContain("deep scan");
    expect(scan).toContain("Ada Dev");
  });
});
