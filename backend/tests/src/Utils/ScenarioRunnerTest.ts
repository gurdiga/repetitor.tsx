import {runScenario} from "backend/src/ScenarioRunner";
import {expect} from "chai";

describe("runScenario", () => {
  const scenarioInput = {};
  const session = {userId: 42, email: "test@example.com"};

  it("passes the session by reference to scenarios that require it", async () => {
    const scenarioName = "Logout";

    await runScenario(session, scenarioName, scenarioInput);

    expect(session.userId).to.be.undefined;
  });

  describe("unhappy paths", () => {
    it("throws a proper error when scenario name is missing", async () => {
      try {
        await runScenario(session, undefined, scenarioInput);
      } catch (e) {
        expect(e.message).to.equal(`The "scenarioName" param is required`);
      }
    });

    it("throws a proper error when scenario name is unrecognized", async () => {
      try {
        async () => await runScenario(session, "MoonWalk", scenarioInput);
      } catch (e) {
        expect(e.message).to.equal(`Could not find scenario handler: "MoonWalk"`);
      }
    });
  });
});
