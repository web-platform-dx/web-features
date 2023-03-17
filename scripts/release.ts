import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import winston from "winston";
import yargs from "yargs";

const semverChoices = ["major", "minor", "patch", "prerelease"] as const;

const loggerTransport = new winston.transports.Console({ level: "silly" });
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [loggerTransport],
});

let targetRepo = "web-platform-dx/feature-set";
// targetRepo = "ddbeck/feature-set"; // Uncomment this line to point this at a fork for testing

const packages = {
  "web-features": fileURLToPath(
    new URL("../packages/web-features", import.meta.url)
  ),
};

yargs(process.argv.slice(2))
  .scriptName("release")
  .usage("$0 <cmd> [args]")
  .command({
    command: "init",
    describe: "Start a new release pull request",
    builder: (yargs) => {
      return yargs
        .positional("semverlevel", {
          describe: "the Semantic Versioning level for the release",
          choices: semverChoices,
          default: "patch",
        })
        .demandOption("semverlevel", "You must provide a semver level");
    },
    handler: init,
  })
  .command({
    command: "update",
    describe: "Update an existing release pull request",
    builder: (yargs) => {
      return yargs
        .positional("pr", {
          describe: "the PR to rebase and update",
        })
        .option("bump", {
          describe: "Update the Semantic Versioning level for the release",
          nargs: 1,
          choices: semverChoices,
        });
    },
    handler: update,
  })
  .command({
    command: "publish",
    describe: "Publish the package to npm",
    builder: (yargs) => {
      return yargs.option("dry-run", {
        type: "boolean",
        describe: "Do everything short of publishing",
      });
    },
    handler: publish,
  }).argv;

function init(args) {
  preflight({ expectedBranch: "main " });

  const diff = diffJson();

  // Start a release branch
  // Convention borrowed from https://github.com/w3c/webref/blob/60ebf71b9d555c523975cfefb08f5420d12b7293/tools/prepare-release.js#L164-L165
  const releaseBranch = `release-${new Date()
    .toISOString()
    .replace(/[\-T:\.Z]/g, "")}`;
  logger.info(`Starting release branch ${releaseBranch}`);
  const branchCmd = `git branch ${releaseBranch} HEAD`;
  run(branchCmd);

  // Check out release branch
  logger.info(`Checking out release branch ${releaseBranch}`);
  const checkoutCmd = `git checkout ${releaseBranch}`;
  logger.debug(checkoutCmd);
  execSync(checkoutCmd);

  // Bump version (no tag)
  const newVersion = bumpVersion(args.semverlevel);

  // Commit
  logger.info("Committing version bump");
  const commitMessage = `Increment ${args.semverlevel} version to v${newVersion}`;
  const commitCmd = `git commit --all --message="${commitMessage}"`;
  run(commitCmd);

  // Push release branch
  logger.info("Pushing release branch");
  const pushCmd = `git push --set-upstream origin ${releaseBranch}`;
  run(pushCmd);

  // Create PR
  logger.info(`Creating PR for ${newVersion}`);
  const title = `📦 Release web-features@${newVersion}`;
  const reviewer = "ddbeck";
  const body = makePullBody(diff);

  const pullRequestCmd = [
    "gh pr create",
    `--title="${title}"`,
    `--reviewer="${reviewer}"`,
    `--body-file=-`,
    `--base="main"`,
    `--head="${releaseBranch}"`,
    `--repo="${targetRepo}"`,
  ].join(" ");
  execSync(pullRequestCmd, {
    input: body,
    stdio: ["pipe", "inherit", "inherit"],
  });
}

function bumpVersion(semverlevel: typeof semverChoices): string {
  const bumpCmd = `npm version --no-git-tag-version ${semverlevel}`;
  logger.info("Bumping version number");
  logger.debug(bumpCmd);
  execSync(bumpCmd, { cwd: packages["web-features"], stdio: "inherit" });
  const { version } = JSON.parse(
    readFileSync(join(packages["web-features"], "package.json"), {
      encoding: "utf-8",
    })
  );
  return version;
}

function makePullBody(diff: string) {
  const bodyFile = fileURLToPath(
    new URL("release-pull-description.md", import.meta.url)
  );
  const body = [
    readFileSync(bodyFile, { encoding: "utf-8" }),
    "```diff",
    diff,
    "```",
  ].join("\n");
  return body;
}

function update(args) {
  preflight({ expectedPull: args.pr });
  build();

  // TODO: Generate a diff
  // const diff = diffJson();

  // TODO: Update description with new diff

  // TODO: Refactor `npm version` to shared function
  // TODO: If selected, bump verison number by argument
  // TODO: Commit results of `npm version`

  // TODO: Push

  // TODO: Update description to hide rebase message

  // const editPullCmd = [
  //   `gh pr edit ${args.pr}`,
  //   `--body-file=${temporaryBodyFile}`,
  //   `--repo="${targetRepo}"`,
  // ].join(" ");
  throw Error("Not implemented");
}

function publish(args) {
  preflight({ expectedPull: args.pr });
  build();

  logger.info("Publishing release");
  let publishCmd = `npm publish`;
  if (args.dryRun) {
    publishCmd = `${publishCmd} --dry-run`;
  }
  execSync(publishCmd, { cwd: packages["web-features"], stdio: "inherit" });
}

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
}

function build() {
  logger.info("Building release");
  run("npm run build");
}

function diffJson(): string {
  const temporaryDir = mkdtempSync(join(tmpdir(), "web-features-"));

  execSync("npm install web-features", {
    cwd: temporaryDir,
    stdio: "inherit",
  });

  const releasedJson = join(
    temporaryDir,
    "node_modules",
    "web-features",
    "index.json"
  );
  const prettyReleasedJson = execSync(`jq . "${releasedJson}"`, {
    encoding: "utf-8",
  });
  const prettyReleasedJsonFp = join(temporaryDir, "index.released.pretty.json");
  writeFileSync(prettyReleasedJsonFp, prettyReleasedJson);

  build();
  const preparedJson = join(packages["web-features"], "index.json");
  const prettyPreparedJson = execSync(`jq . "${preparedJson}"`, {
    encoding: "utf-8",
  });
  const prettyPreparedJsonFp = join(temporaryDir, "index.prepared.pretty.json");
  writeFileSync(prettyPreparedJsonFp, prettyPreparedJson);

  try {
    const result = execSync(
      `diff --unified "${prettyReleasedJsonFp}" "${prettyPreparedJsonFp}"`,
      { encoding: "utf-8" }
    );
    rmSync(temporaryDir, { recursive: true });
    return result;
  } catch (err) {
    // For diff's exit status, "1 means some differences were found, and 2 means trouble."
    if (err.status === 1) {
      const result = err.stdout;
      rmSync(temporaryDir, { recursive: true });
      return result;
    }
    throw err;
  }
}

function preflight(options: {
  expectedBranch?: string;
  expectedPull?: string;
}): void {
  logger.info("Running preflight checks");

  logger.verbose("Checking that working directory is clean");
  const cleanCmd = "git diff-index --quiet HEAD";
  try {
    logger.debug(cleanCmd);
    execSync(cleanCmd);
  } catch (err) {
    logger.error(
      "Working directory is not clean. Stash your changes and try again."
    );
    process.exit(1);
  }

  logger.verbose("Confirming gh CLI is installed and authorized");
  const ghVersionCmd = "gh version";
  try {
    logger.debug(ghVersionCmd);
    execSync(ghVersionCmd);
  } catch (err) {
    logger.error("gh CLI failed to run. Do you have it installed?", err.error);
    process.exit(1);
  }

  const ghAuthStatus = "gh auth status";
  try {
    logger.debug(ghAuthStatus);
    run(ghAuthStatus);
  } catch (err) {
    logger.error(
      "`gh auth status` was non-zero. Try running `gh auth login` or `gh auth refresh` and try again.",
      err.error
    );
    logger.error(err.stderr);
    process.exit(1);
  }

  logger.verbose("Confirming jq is installed");
  const jqVersionCmd = "jq --version";
  try {
    logger.debug(jqVersionCmd);
    execSync(jqVersionCmd);
  } catch (err) {
    logger.error("jq failed to run. Do you have it installed?", err.error);
    process.exit(1);
  }

  logger.verbose("Checking base branch");
  const headCmd = "git rev-parse --abbrev-ref HEAD";
  logger.debug(headCmd);
  const head = execSync(headCmd, { encoding: "utf-8" }).trim();

  let headRefName;
  if (options.expectedPull) {
    headRefName = execSync(
      `gh pr view ${options.expectedPull} --json headRefName`,
      {
        encoding: "utf-8",
      }
    ).trim();
  }

  const expectedRef = headRefName ?? options.expectedBranch;

  if (head !== expectedRef) {
    // TODO: uncomment below, after we create a GitHub Actions workflow to run this script automatically
    // logger.error(`Base banch is not ${expectedBranch}`);
    // process.exit(1);
    logger.warn(`Base banch is not ${expectedRef}`);
  }
}
