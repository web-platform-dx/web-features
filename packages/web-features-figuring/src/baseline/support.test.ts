import assert from "assert/strict";
import { Compat } from "../browser-compat-data";
import { lastInitialRelease } from "./support";

describe("lastInitialRelease", function () {
  it("returns undefined for no releases", function () {
    assert.equal(lastInitialRelease([]), undefined);
  });

  it("returns a single release", function () {
    const cr100 = new Compat().browser("chrome").version("100");

    const result = lastInitialRelease([cr100]);
    assert.equal(result, cr100, `${result} is not ${cr100}`);
  });

  it("returns the least-recent release in a consecutive series", function () {
    const cr = new Compat().browser("chrome");
    const cr100 = cr.version("100");
    const cr99 = cr.version("99");

    const result = lastInitialRelease([cr99, cr100]);
    assert.equal(result, cr99, `${result} is not ${cr99}`);
  });

  it("returns the least-recent consecutive release ", function () {
    const cr = new Compat().browser("chrome");
    const cr100 = cr.version("100");
    const cr99 = cr.version("99");
    const cr95 = cr.version("95");
    const cr94 = cr.version("95");

    const result = lastInitialRelease([cr94, cr95, cr99, cr100]);
    assert.equal(result, cr99, `${result} is not ${cr99}`);
  });
});
