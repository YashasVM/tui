#!/usr/bin/env node
import React from "react";
import {render} from "ink";
import meow from "meow";
import {App} from "./app.js";
import {loadPortfolioContent, resolveDataDir} from "./content.js";
import {syncGitHubSnapshot} from "./github.js";

const cli = meow(
  `
  Usage
    $ tui-portfolio
    $ tui-portfolio sync --user <github-username>

  Options
    --user, -u      GitHub username for sync
    --data-dir      Directory containing profile.json, projects.json, and github.generated.json

  Commands
    sync            Fetch public GitHub repositories into data/github.generated.json
  `,
  {
    importMeta: import.meta,
    flags: {
      user: {
        type: "string",
        shortFlag: "u"
      },
      dataDir: {
        type: "string"
      }
    }
  }
);

const command = cli.input[0];
const dataDir = resolveDataDir(cli.flags.dataDir);

if (command === "sync") {
  if (!cli.flags.user) {
    console.error("missing required flag: --user <github-username>");
    process.exit(1);
  }

  try {
    const snapshot = await syncGitHubSnapshot({user: cli.flags.user, dataDir});
    console.log(`synced ${snapshot.repos.length} repos for ${snapshot.user} into ${dataDir}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
} else {
  try {
    const content = await loadPortfolioContent(dataDir);
    render(<App content={content} />);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
