import {describe, expect, it} from "vitest";
import {
  renderMatrixRain,
  renderOpsGrid,
  renderProjectDossier,
  renderProjectConstellation,
  renderReactor,
  renderSignalScope,
  renderSkillRadar,
  renderSystemScan,
  renderTransmission
} from "../src/spectacle.js";
import {fixtureContent} from "./fixtures.js";

describe("spectacle renderers", () => {
  it("renders animated terminal panels from content", () => {
    expect(renderSignalScope(1).join("\n")).toContain("signal scope");
    expect(renderProjectConstellation(fixtureContent.projects, 1).join("\n")).toContain("console-kit");
    expect(renderProjectDossier(fixtureContent.projects[0], 1).join("\n")).toContain("project dossier");
    expect(renderSkillRadar(fixtureContent.skills, 1).join("\n")).toContain("Languages");
    expect(renderReactor(fixtureContent, 1).join("\n")).toContain("portfolio reactor");
    expect(renderMatrixRain(fixtureContent, 1)).toHaveLength(7);
    expect(renderOpsGrid(fixtureContent, 1).join("\n")).toContain("ops grid");
    expect(renderTransmission(fixtureContent, 1).join("\n")).toContain("transmission array");
  });

  it("summarizes portfolio readiness", () => {
    const scan = renderSystemScan(fixtureContent).join("\n");
    expect(scan).toContain("deep scan");
    expect(scan).toContain("Ada Dev");
  });
});
