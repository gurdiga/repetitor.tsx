import {expect} from "chai";
import * as Sinon from "sinon";
import {runScenario} from "Utils/ScenarioRunner";

describe("runScenario", () => {
  const dto = {};

  it("runs an existing scenario and returns its result", async () => {
    const scenarioName = "TestScenario";
    const result = await runScenario(scenarioName, dto);

    expect(result).to.deep.equal({rows: [{sum: 2}]});
  });

  describe("session altering scenarios", () => {
    it("passes the session by reference to scenarios that require it", async () => {
      const scenarioName = "Logout";
      const session = {userId: 42};

      await runScenario(scenarioName, dto, session);

      expect(session.userId).to.be.undefined;
    });
  });

  describe("unhappy paths", () => {
    it("throws a proper error when scenario name is missing", async () => {
      await expect(runScenario(undefined, dto)).to.eventually.be.rejectedWith(`The "scenarioName" param is required`);
    });

    it("throws a proper error when scenario name is unrecognized", async () => {
      await expect(runScenario("MoonWalk", dto)).to.eventually.be.rejectedWith(
        `Could not find scenario handler: "MoonWalk"`
      );
    });

    it("throws a proper error when scenario needs the session and does not receive it", async () => {
      const session = undefined;

      await expect(runScenario("Logout", dto, session)).to.eventually.be.rejectedWith(`Session is missing`);
    });
  });
});
