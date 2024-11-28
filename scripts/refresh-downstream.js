import https from 'node:https'
import fs from 'node:fs'

const compareVersions = (incomingVersionString, previousVersionString) => {

  let [incomingVersionStringMajor, incomingVersionStringMinor] = incomingVersionString.split(".");
  let [previousVersionStringMajor, previousVersionStringMinor] = previousVersionString.split(".");

  console.log(incomingVersionStringMajor, incomingVersionStringMinor, previousVersionStringMajor, previousVersionStringMinor);
  if (incomingVersionStringMinor) {
    if (
      parseInt(incomingVersionStringMajor) >= parseInt(previousVersionStringMajor)
      &&
      parseInt(incomingVersionStringMinor) > parseInt(previousVersionStringMinor)
    ) {
      return true
    }
  } else {
    if (incomingVersionStringMajor > incomingVersionStringMinor) {
      return true
    }
  }
  return false
}

const findLatestVersion = (releases) => {
  return Object.entries(releases).sort((a, b) => compareVersions(a[0], b[0])).pop();
}

const handleUas = (uaObject) => {

  let somethingChanged = false;

  const existingData = JSON.parse(fs.readFileSync('../packages/baseline-browser-mapping/data/downstream-browsers.json', { encoding: 'utf8' }));

  const versionMappings = new Object();

  const browsers = [
    {
      name: "qq_android",
      latestExistingVersion: findLatestVersion(existingData.browsers["uc_android"].releases),
      regex: new RegExp("chrome|Chrome\/(\\d+).*MQQBrowser\/(\\d+\\.\\d+)")
    },
    {
      name: "uc_android",
      latestExistingVersion: findLatestVersion(existingData.browsers["uc_android"].releases),
      regex: new RegExp("chrome|Chrome\/(\\d+).*UCBrowser\/(\\d+\\.\\d+)")
    },
    {
      name: "ya_android",
      latestExistingVersion: findLatestVersion(existingData.browsers["ya_android"].releases),
      regex: new RegExp("android|Android.*chrome|Chrome\/(\\d+).*YaBrowser\/(\\d+\\.\\d+)")
    },
    /* More work to be done building out mappings for other browsers */
    // { name: "CocCocBrowser", regex: new RegExp("coc_coc_browser\/(\\d+).*Chrome\/(\\d+).") }
  ];

  uaObject.uas.reverse().forEach(ua => {
    browsers.forEach(browser => {
      let browserVersionMatch = ua.ua.match(browser.regex);
      if (browserVersionMatch) {
        let browserName = browser.name;
        let browserVersion;
        let chromiumVersion;
        if (browserVersionMatch[0] == "coc_coc_browser") {
          browserVersion = browserVersionMatch[3].toString().trim();
          chromiumVersion = browserVersionMatch[2].toString().trim();
        } else {
          browserVersion = browserVersionMatch[2].toString().trim();
          chromiumVersion = browserVersionMatch[1].toString().trim();
        }

        if (browserVersion != undefined) {
          if (
            compareVersions(browserVersion, browser.latestExistingVersion[0])
            &&
            parseFloat(chromiumVersion) >= parseFloat(browser.latestExistingVersion[1].engine_version)
            &&
            !Object.keys(existingData.browsers[browserName].releases).includes(browserVersion.toString())
          ) {
            console.log("adding ", browserName, " version ", browserVersion, " with Chromium version ", chromiumVersion, " and release date ", ua.firstSeen);
            existingData.browsers[browserName].releases[browserVersion] = {
              "engine": "Blink",
              "engine_version": chromiumVersion,
              "status": "unknown",
              "release_date": ua.firstSeen
            }
            somethingChanged = true;
          }
        }

      }
    })
  });

  return [somethingChanged, existingData];
}

if (process.argv.length === 2) {
  console.error('Expected at least one argument!');
  process.exit(1);
} else {

  const options = {
    hostname: 'api.useragents.io',
    port: 443,
    path: '/api/v1/web-platform-baseline',
    method: 'GET',
    headers: {
      'x-api-key': `Bearer ${process.argv[2]}`,
      'Content-Type': ' application/json'
    }
  }

  let latestUas = new String();

  https.request(options, (res) => {

    let output = [];
    console.log('status code: ', res.statusCode)
    res.on('data', (d) => {
      output.push(d);
    });

    res.on('end', () => {

      latestUas = JSON.parse(Buffer.concat(output).toString());
      let [willWrite, fileOutput] = handleUas(latestUas);
      if (willWrite) {

        fileOutput.lastUpdated = new Date();
        fs.writeFileSync('../packages/baseline-browser-mapping/data/downstream-browsers.json', JSON.stringify(fileOutput, null, 2), { flags: 'w' })

        let packageJson = JSON.parse(fs.readFileSync('../packages/baseline-browser-mapping/package.json', { encoding: 'utf8' }));
        let currentVersion = packageJson.version.split(".");
        packageJson.version = `${currentVersion[0]}.${currentVersion[1]}.${parseInt(currentVersion[2]) + 1}`
        fs.writeFileSync('../packages/baseline-browser-mapping/package.json', JSON.stringify(packageJson, null, 2), { encoding: 'utf8' });

      } else {
        console.log("no updates at this time");
      }
    });
  }).end();

}