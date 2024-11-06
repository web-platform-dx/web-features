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
    winston.format.simple(),
  ),
  transports: [loggerTransport],
});

const pullTitleBase = `📦 Release web-features@`;

const packages = {
  "web-features": fileURLToPath(
    new URL("../packages/web-features", import.meta.url),
  ),
};

yargs(process.argv.slice(2))
  .scriptName("release")
  .usage("$0 <cmd> [args]")
  .option("target-repo", {
    describe: "Select upstream GitHub repository",
    nargs: 1,
    default: "web-platform-dx/web-features",
  })
  .command({
    command: "diff [from [to]]",
    describe:
      "Compare the contents of a prior release to HEAD or another prior version",
    builder: (yargs) => {
      yargs.positional("from", {
        describe: "the published web-features release to compare against",
        type: "string",
        default: "latest",
      });
      yargs.positional("to", {
        describe: "the published web-features release to compare against",
        type: "string",
      });
    },
    handler: diff,
  })
  .command({
    command: "init <semverlevel>",
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
  }).argv;

function init(args) {
  preflight({ expectedBranch: "main" });

  const diff = diffJson();

  // Start a release branch
  // Convention borrowed from https://github.com/w3c/webref/blob/60ebf71b9d555c523975cfefb08f5420d12b7293/tools/prepare-release.js#L164-L165
  const releaseBranch = `release/web-features/${new Date()
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

  // Push release branch
  logger.info("Pushing release branch");
  const pushCmd = `git push --set-upstream origin ${releaseBranch}`;
  run(pushCmd);

  // Create PR
  const title = [pullTitleBase, newVersion].join("");
  logger.info(`Creating PR: ${title}`);
  const reviewer = "ddbeck";
  const body = makePullBody(diff);

  const pullRequestCmd = [
    "gh pr create",
    `--title="${title}"`,
    `--reviewer="${reviewer}"`,
    `--body-file=-`,
    `--base="main"`,
    `--head="${releaseBranch}"`,
    `--repo="${args.targetRepo}"`,
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
  const { version } = readPackageJSON(packages["web-features"]);

  // Commit
  logger.info("Committing version bump");
  const commitMessage = `Increment ${semverlevel} version to v${version}`;
  const commitCmd = `git commit --all --message="${commitMessage}"`;
  run(commitCmd);

  return version;
}

function makePullBody(diff: string) {
  const bodyFile = fileURLToPath(
    new URL("release-pull-description.md", import.meta.url),
  );
  const body = [
    readFileSync(bodyFile, { encoding: "utf-8" }),
    "```diff",
    diff,
    "```",
  ].join("\n");
  return body;
}

function diff(args) {
  const diff = diffJson(args.from, args.to);
  console.log(diff);
}

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
}

function build() {
  logger.info("Building release");
  run("npm run build");
}

function prettyJson(sourceFp: string): string {
  return (
    JSON.stringify(
      JSON.parse(readFileSync(sourceFp, { encoding: "utf-8" })),
      undefined,
      2,
    ) + "\n"
  );
}

function readPackageJSON(packageDir) {
  return JSON.parse(
    readFileSync(join(packageDir, "package.json"), {
      encoding: "utf-8",
    }),
  );
}

function diffJson(from: string = "latest", to?: string): string {
  const temporaryDir = mkdtempSync(join(tmpdir(), "web-features-"));

  function pkgToJsonFile(version: string): string {
    execSync(`npm install web-features@${version}`, {
      cwd: temporaryDir,
      stdio: "inherit",
    });

    const pkgJson = join(
      temporaryDir,
      "node_modules",
      "web-features",
      "data.json",
    );
    const prettyPkgJson = prettyJson(pkgJson);
    const fp = join(temporaryDir, `data.${version}.json`);
    writeFileSync(fp, prettyPkgJson);
    return fp;
  }

  const fromFp = pkgToJsonFile(from);
  const toFp: string = (() => {
    if (to) {
      return pkgToJsonFile(to);
    } else {
      build();
      const preparedJson = join(packages["web-features"], "data.json");
      const prettyPreparedJson = prettyJson(preparedJson);
      const fp = join(temporaryDir, "data.HEAD.json");
      writeFileSync(fp, prettyPreparedJson);
      return fp;
    }
  })();

  try {
    const result = execSync(`diff --unified "${fromFp}" "${toFp}"`, {
      encoding: "utf-8",
    });
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

type PreflightOptions =
  | {
      expectedPull: string;
      targetRepo: string;
    }
  | {
      expectedBranch: string;
    };

function preflight(options: PreflightOptions): void {
  logger.info("Running preflight checks");

  logger.verbose("Checking that working directory is clean");
  const cleanCmd = "git diff-index --quiet HEAD";
  try {
    logger.debug(cleanCmd);
    execSync(cleanCmd);
  } catch (err) {
    logger.error(
      "Working directory is not clean. Stash your changes and try again.",
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
      err.error,
    );
    logger.error(err.stderr);
    process.exit(1);
  }

  logger.verbose("Checking starting branch");
  const headCmd = "git rev-parse --abbrev-ref HEAD";
  logger.debug(headCmd);
  const head = execSync(headCmd, { encoding: "utf-8" }).trim();

  // The current branch (`head`, here) is easy enough to determine. The
  // *correct* branch is harder to check. If `options.expectedBranch` is
  // undefined, then we ask GitHub what to expect.
  let expectedRef;
  if ("expectedPull" in options) {
    const { headRefName } = JSON.parse(
      execSync(
        `gh pr view --repo="${options.targetRepo}" "${options.expectedPull}" --json headRefName`,
        {
          encoding: "utf-8",
        },
      ),
    );
    expectedRef = headRefName;
  } else {
    expectedRef = options.expectedBranch;
  }

  if (head !== expectedRef) {
    // TODO: uncomment below, after we create a GitHub Actions workflow to run this script automatically
    // logger.error(`Starting branch is not ${expectedRef}`);
    // process.exit(1);
    logger.warn(`Starting branch is not ${expectedRef}`);
  }
}
