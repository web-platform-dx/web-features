import https from "node:https";
import { writeFileSync, readFileSync } from "node:fs";

interface BrowserRelease {
  engine: string;
  engine_version: string;
  status: string;
  release_date: string;
}

interface BrowserData {
  name: string;
  releases: { [version: string]: BrowserRelease };
}

interface DownstreamBrowsersData {
  browsers: { [browserName: string]: BrowserData };
  lastUpdated: string;
}

interface UserAgent {
  ua: string;
  firstSeen: string;
}

interface UserAgentData {
  uas: UserAgent[];
}

const compareVersions = (
  incomingVersionString: string,
  previousVersionString: string,
): number => {
  let [incomingVersionStringMajor, incomingVersionStringMinor] =
    incomingVersionString.split(".");
  let [previousVersionStringMajor, previousVersionStringMinor] =
    previousVersionString.split(".");

  if (!incomingVersionStringMajor || !previousVersionStringMajor) {
    throw new Error(
      "One of these version strings is broken: " +
        incomingVersionString +
        " or " +
        previousVersionString +
        "",
    );
  }

  if (incomingVersionStringMinor) {
    if (
      parseInt(incomingVersionStringMajor) >=
        parseInt(previousVersionStringMajor) &&
      (!previousVersionStringMinor ||
        parseInt(incomingVersionStringMinor) >
          parseInt(previousVersionStringMinor))
    ) {
      return 1;
    }
  } else {
    if (incomingVersionStringMajor > previousVersionStringMajor) {
      return 1;
    }
  }
  return 0;
};

const findLatestVersion = (releases: {
  [version: string]: BrowserRelease;
}): [string, BrowserRelease] | undefined => {
  return Object.entries(releases)
    .sort((a, b) => compareVersions(a[0], b[0]))
    .pop();
};

const handleUas = (
  uaObject: UserAgentData,
): [boolean, DownstreamBrowsersData] => {
  let somethingChanged = false;

  const existingData: DownstreamBrowsersData = JSON.parse(
    readFileSync(
      process.cwd() +
        "/packages/baseline-browser-mapping/src/data/downstream-browsers.json",
      { encoding: "utf8" },
    ),
  );

  const browsers = [
    {
      name: "qq_android",
      latestExistingVersion: findLatestVersion(
        existingData.browsers["qq_android"].releases,
      ),
      regex: new RegExp("chrome|Chrome\/(\\d+).*MQQBrowser\/(\\d+\\.\\d+)"),
    },
    {
      name: "uc_android",
      latestExistingVersion: findLatestVersion(
        existingData.browsers["uc_android"].releases,
      ),
      regex: new RegExp("chrome|Chrome\/(\\d+).*UCBrowser\/(\\d+\\.\\d+)"),
    },
    {
      name: "ya_android",
      latestExistingVersion: findLatestVersion(
        existingData.browsers["ya_android"].releases,
      ),
      regex: new RegExp(
        "android|Android.*chrome|Chrome\/(\\d+).*YaBrowser\/(\\d+\\.\\d+)",
      ),
    },
  ];

  uaObject.uas.reverse().forEach((ua) => {
    browsers.forEach((browser) => {
      let browserVersionMatch = ua.ua.match(browser.regex);
      if (browserVersionMatch) {
        let browserName = browser.name;
        let browserVersion;
        let chromiumVersion;
        if (browserVersionMatch[0] == "coc_coc_browser") {
          browserVersion = browserVersionMatch[3].toString().trim();
          chromiumVersion = browserVersionMatch[2].toString().trim();
        } else {
          if (browserVersionMatch[1] && browserVersionMatch[2]) {
            browserVersion = browserVersionMatch[2].toString().trim();
            chromiumVersion = browserVersionMatch[1].toString().trim();
          }
        }
        if (browserVersion != undefined) {
          if (
            compareVersions(
              browserVersion,
              browser.latestExistingVersion?.[0] ?? "",
            ) &&
            parseFloat(chromiumVersion) >=
              parseFloat(
                browser.latestExistingVersion?.[1].engine_version ?? "",
              ) &&
            !Object.keys(existingData.browsers[browserName].releases).includes(
              browserVersion.toString(),
            )
          ) {
            console.log(
              "adding ",
              browserName,
              " version ",
              browserVersion,
              " with Chromium version ",
              chromiumVersion,
              " and release date ",
              ua.firstSeen,
            );
            existingData.browsers[browserName].releases[browserVersion] = {
              engine: "Blink",
              engine_version: chromiumVersion,
              status: "unknown",
              release_date: ua.firstSeen,
            };
            somethingChanged = true;
          }
        }
      }
    });
  });

  return [somethingChanged, existingData];
};

if (process.argv.length === 2) {
  console.error("Expected at least one argument!");
  process.exit(1);
} else {
  const options = {
    hostname: "api.useragents.io",
    port: 443,
    path: "/api/v1/web-platform-baseline",
    method: "GET",
    headers: {
      "x-api-key": `Bearer ${process.argv[2]}`,
      "Content-Type": " application/json",
    },
  };

  let latestUas: UserAgentData;

  https
    .request(options, (res) => {
      let output: Buffer[] = [];
      console.log("status code: ", res.statusCode);
      res.on("data", (d) => {
        output.push(d);
      });

      res.on("end", () => {
        latestUas = JSON.parse(Buffer.concat(output).toString());
        let [willWrite, fileOutput] = handleUas(latestUas);
        if (willWrite) {
          fileOutput.lastUpdated = new Date().toISOString();
          writeFileSync(
            process.cwd() +
              "/packages/baseline-browser-mapping/src/data/downstream-browsers.json",
            JSON.stringify(fileOutput, null, 2),
            { flag: "w" },
          );

          let packageJson = JSON.parse(
            readFileSync(
              process.cwd() + "/packages/baseline-browser-mapping/package.json",
              { encoding: "utf8" },
            ),
          );
          let currentVersion = packageJson.version.split(".");
          currentVersion[2]++;
          packageJson.version = currentVersion.join(".");
          writeFileSync(
            process.cwd() + "/packages/baseline-browser-mapping/package.json",
            JSON.stringify(packageJson, null, 2),
            { encoding: "utf8" },
          );
        } else {
          console.log("no updates at this time");
        }
      });
    })
    .end();
}
