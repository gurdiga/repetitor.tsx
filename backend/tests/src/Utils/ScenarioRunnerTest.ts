import {expect} from "chai";
import {runScenario} from "backend/src/ScenarioRunner";

describe("runScenario", () => {
  const scenarioInput = {};
  const session = {userId: 42};

  it("passes the session by reference to scenarios that require it", async () => {
    const scenarioName = "Logout";

    await runScenario(scenarioName, scenarioInput, session);

    expect(session.userId).to.be.undefined;
  });

  describe("unhappy paths", () => {
    it("throws a proper error when scenario name is missing", async () => {
      try {
        await runScenario(undefined, scenarioInput, session);
      } catch (e) {
        expect(e.message).to.equal(`The "scenarioName" param is required`);
      }
    });

    it("throws a proper error when scenario name is unrecognized", async () => {
      try {
        async () => await runScenario("MoonWalk", scenarioInput);
      } catch (e) {
        expect(e.message).to.equal(`Could not find scenario handler: "MoonWalk"`);
      }
    });
  });
});
