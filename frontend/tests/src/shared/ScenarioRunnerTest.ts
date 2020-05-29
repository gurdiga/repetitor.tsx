import {expect} from "chai";
import {runScenario} from "frontend/shared/src/ScenarioRunner";
import * as Sinon from "sinon";

describe("ScenarioRunner", () => {
  describe("runScenario", () => {
    const {document: originalDocument} = global as any;
    const {fetch: originalFetch} = global as any;

    const metaTag = {getAttribute: Sinon.stub().returns("the-CSRF-token")};
    const querySelectorStub = Sinon.stub().returns(metaTag);

    const responseJSON = {some: "data"};
    const fetchStub = Sinon.stub().resolves({status: 200, json: Sinon.stub().resolves(responseJSON)});

    beforeEach(() => {
      (global as any).document = {head: {querySelector: querySelectorStub}};
      (global as any).fetch = fetchStub;
    });

    afterEach(() => {
      (global as any).document = originalDocument;
      (global as any).fetch = originalFetch;
      querySelectorStub.reset();
    });

    it("returns the parsed response JSON", async () => {
      const result = await runScenario("Login", {email: "some@email.com", password: "53cr37"});

      const expectedRequestUrl = "/";
      const expectedRequestSettings = Sinon.match({
        body: JSON.stringify({
          scenarioName: "Login",
          scenarioInput: {email: "some@email.com", password: "53cr37"},
          _csrf: "the-CSRF-token",
        }),
        cache: "no-store",
        headers: {"Content-Type": "application/json"},
        method: "POST",
        redirect: "error",
      });

      expect(result).to.deep.equal(responseJSON);
      expect(querySelectorStub).to.have.been.calledOnceWithExactly(`meta[name="csrf_token"]`);
      expect(fetchStub).to.have.been.calledOnceWithExactly(expectedRequestUrl, expectedRequestSettings);
    });
  });
});
