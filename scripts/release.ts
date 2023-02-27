import { execSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import winston from "winston";
import yargs from "yargs";

const loggerTransport = new winston.transports.Console({ level: "silly" });
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [loggerTransport],
});

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
          choices: ["major", "minor", "patch", "prerelease"],
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
        .demandOption("pr");
    },
    handler: update,
  })
  .command({
    command: "publish",
    describe: "Publish the package to npm",
    builder: (yargs) => {
      return yargs
        .positional("pr", {
          describe: "the PR to rebase and update",
        })
        .demandOption("pr");
    },
    handler: publish,
  }).argv;

function init(args) {
  preflight();

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
  const bumpCmd = `npm version --no-git-tag-version ${args.semverlevel}`;
  logger.info("Bumping version number");
  logger.debug(bumpCmd);
  execSync(bumpCmd, { cwd: packages["web-features"], stdio: "inherit" });
  const { version } = JSON.parse(
    readFileSync(join(packages["web-features"], "package.json"), {
      encoding: "utf-8",
    })
  );

  // Commit
  logger.info("Committing version bump");
  const commitMessage = `Increment ${args.semverlevel} version to v${version}`;
  const commitCmd = `git commit --all --message="${commitMessage}"`;
  run(commitCmd);

  // Push release branch
  logger.info("Pushing release branch");
  const pushCmd = `git push --set-upstream origin ${releaseBranch}`;
  run(pushCmd);

  // Create PR
  logger.info(`Creating PR for ${version}`);
  const title = `📦 Release web-features@${version}`;
  const reviewer = "ddbeck";
  const bodyFile = fileURLToPath(
    new URL("release-pull-description.md", import.meta.url)
  );

  const temporaryDir = mkdtempSync(join(tmpdir(), "pull-request-"));
  const temporaryBodyFile = join(temporaryDir, "body.md");
  copyFileSync(bodyFile, temporaryBodyFile);
  appendFileSync(temporaryBodyFile, ["```diff", diff, "```"].join("\n"));

  const pullRequestCmd = [
    "gh pr create",
    `--title="${title}"`,
    `--reviewer="${reviewer}"`,
    `--body-file=${temporaryBodyFile}`,
    `--base="main"`,
    `--head="${releaseBranch}"`,
    // `--repo="ddbeck/feature-set"`, // Uncomment this line to point this at a fork for testing
  ].join(" ");
  run(pullRequestCmd);

  rmSync(temporaryDir, { recursive: true });
}

function update(args) {
  // TODO: Rebase
  // TODO: Run `npm run build`
  // TODO: Commit results of `npm run build`
  // TODO: Update PR diff
  throw Error("Not implemented");
}

function publish(args) {
  // TODO: Run `npm publish …`
  throw Error("Not implemented");
}

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
}

function diffJson(): string {
  const temporaryDir = mkdtempSync(join(tmpdir(), "web-features-"));

  execSync("npm install web-features", {
    cwd: temporaryDir,
    encoding: "utf-8",
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

  execSync("npm run build", { stdio: "inherit" });
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
    if (err.status === 1) {
      const result = err.stdout;
      rmSync(temporaryDir, { recursive: true });
      return result;
    }
    throw err;
  }
}

function preflight(): void {
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

  logger.verbose("Checking base branch");
  const headCmd = "git rev-parse --abbrev-ref HEAD";
  logger.debug(headCmd);
  const head = execSync(headCmd, { encoding: "utf-8" }).trim();

  if (head !== "main") {
    // TODO: uncomment below, after we create a GitHub Actions workflow to do this automatically
    // logger.error("Base banch is not main");
    // process.exit(1);
    logger.warn("Base banch is not main");
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
}
