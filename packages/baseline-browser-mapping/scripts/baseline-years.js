import bcdBrowsers from "@mdn/browser-compat-data" assert { type: "json"}
import otherBrowsers from "../data/downstream-browsers.json" assert { type: "json"}

const bcdCoreBrowserNames = [
    "chrome",
    "chrome_android",
    "edge",
    "firefox",
    "firefox_android",
    "safari",
    "safari_ios",
]

const coreBrowserData = Object.entries(bcdBrowsers.browsers).filter(([browserName, browserData]) => bcdCoreBrowserNames.includes(browserName));

const bcdDownstreamBrowserNames = [
    "webview_android",
    "samsunginternet_android",
    "opera_android",
    "opera"
]

const otherDownstreamBrowserNames = [
    "QQBrowser",
    "UCBrowser",
]

const downstreamBrowserData = [
    ...Object.entries(bcdBrowsers.browsers).filter(([browserName, browserData]) => bcdDownstreamBrowserNames.includes(browserName)),
    ...Object.entries(otherBrowsers.browsers)
]

const acceptableStatuses = ['current', 'esr', 'retired', 'unknown'];

const getCoreVersionsByDate = (date, minOnly = true) => {

    if (new Date(date).getFullYear() < 2015) {
        throw new Error("There are no browser versions compatible with Baseline before 2015")
    }

    if (new Date(date).getFullYear() >= new Date().getFullYear()) {
        throw new Error("There are no browser versions compatible with Baseline in the future")
    }

    let versions = new Array();

    coreBrowserData.forEach(([browserName, browserData]) => {

        let sortedVersions = Object.entries(browserData.releases)
            .filter(([versionNumber, versionData]) => {
                if (!acceptableStatuses.includes(versionData.status)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))

        for (let i = 1; i < sortedVersions.length; i++) {
            const [versionNumber, versionData] = sortedVersions[i];
            const [prevVersionNumber, prevVersionData] = sortedVersions[i - 1];
            if (new Date(versionData.release_date) > new Date(date)) {
                versions.push({
                    browser: browserName,
                    version: prevVersionNumber,
                    release_date: prevVersionData.release_date,
                    engine: null,
                    engine_version: null
                });
                if (minOnly) {
                    break;
                }
            }
        }
    });

    return versions;
}

const getDownstreamBrowsers = (inputArray, minOnly = true) => {

    let coreBrowserArray = inputArray;

    let minimumChromeVersion = coreBrowserArray
        .filter((browser) => browser.browser === "chrome")
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))[0].version;

    let downstreamArray = new Array();

    downstreamBrowserData.forEach(([browserName, browserData]) => {
        let sortedAndFilteredVersions = Object.entries(browserData.releases)
            .filter(([versionNumber, versionData]) => {
                if (!versionData.engine) {
                    return false;
                }
                if (versionData.engine != "Blink") {
                    return false;
                }
                if (parseFloat(versionData.engine_version) < parseFloat(minimumChromeVersion)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

        for (let i = 0; i < sortedAndFilteredVersions.length; i++) {
            const [versionNumber, versionData] = sortedAndFilteredVersions[i];
            downstreamArray.push({
                browser: browserName,
                version: versionNumber,
                release_date: versionData.release_date,
                engine: versionData.engine,
                engine_version: versionData.engine_version
            });
            if (minOnly) {
                break;
            }

        }
    })
    let outputArray = [...coreBrowserArray, ...downstreamArray];
    return outputArray;
}

const baselineBrowserMapping = {
    getMinimumWidelyAvailable (includeDownstream = false) {
        const date30MonthsAgo = new Date().setMonth(new Date().getMonth() - 30);
        let coreBrowserArray = getCoreVersionsByDate(date30MonthsAgo);
        if (!includeDownstream) {
            return coreBrowserArray;
        } else {
            return getDownstreamBrowsers(coreBrowserArray);
        }
    },
    getAllWidelyAvailable (includeDownstream = false) {
        const date30MonthsAgo = new Date().setMonth(new Date().getMonth() - 30);
        let coreBrowserArray =  getCoreVersionsByDate(date30MonthsAgo, false);
        if (!includeDownstream) {
            return coreBrowserArray;
        } else {
            return getDownstreamBrowsers(coreBrowserArray, false);
        }
    },
    getMinimumWidelyAvailableOnDate (dateString, includeDownstream = false) {
        const givenDate = new Date(Date.parse(dateString));
        const givenDateLess30Months = new Date(givenDate.setMonth(givenDate.getMonth() - 30));
        let coreBrowserArray = getCoreVersionsByDate(givenDateLess30Months);
        if (!includeDownstream) {
            return coreBrowserArray;
        } else {
            return getDownstreamBrowsers(coreBrowserArray);
        }
    },
    getAllWidelyAvailableOnDate (dateString, includeDownstream = false) {
        const givenDate = new Date(Date.parse(dateString));
        const givenDateLess30Months = new Date(givenDate.setMonth(givenDate.getMonth() - 30));
        let coreBrowserArray = getCoreVersionsByDate(givenDateLess30Months, false);
        if (!includeDownstream) {
            return coreBrowserArray;
        } else {
            return getDownstreamBrowsers(coreBrowserArray, false);
        }
    },
    getMinimumByYear (year, includeDownstream = false) {
        const date = new Date(parseInt(year) + 1, 0, 1);
        let coreBrowserArray = getCoreVersionsByDate(date);
        if (!includeDownstream) {
            return coreBrowserArray;
        } else {
            return getDownstreamBrowsers(coreBrowserArray);
        }
    },
    getAllByYear (year, includeDownstream = false) {
        const date = new Date(parseInt(year) + 1, 0, 1);
        let coreBrowserArray = getCoreVersionsByDate(date, false);
        if (!includeDownstream) {
            return coreBrowserArray;
        } else {
            return getDownstreamBrowsers(coreBrowserArray, false);
        }
    }

}

export default baselineBrowserMapping;