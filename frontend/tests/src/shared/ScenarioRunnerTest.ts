import {expect} from "chai";
import {runScenario} from "frontend/shared/src/ScenarioRunner";
import * as Sinon from "sinon";

describe("ScenarioRunner", () => {
  describe("runScenario", () => {
    const {document: originalDocument} = global as any;
    const {fetch: originalFetch} = global as any;

    let querySelectorStub: Sinon.SinonStub;

    const responseJSON = {some: "data"};
    let fetchStub: Sinon.SinonStub;

    beforeEach(() => {
      const metaTag = {getAttribute: Sinon.stub().returns("the-CSRF-token")};
      querySelectorStub = Sinon.stub().returns(metaTag);
      (global as any).document = {head: {querySelector: querySelectorStub}};

      fetchStub = Sinon.stub().resolves({status: 200, json: Sinon.stub().resolves(responseJSON)});
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

    describe("unhappy paths", () => {
      Object.entries({
        "when the CSRF meta tag is not found": {
          setup: () => querySelectorStub.returns(null),
          expectedResult: {
            error: "Lipsește codul CSRF (meta tag)",
            kind: "TransportError",
          },
        },
        "when the CSRF meta tag has empty `content` attribute": {
          setup: () => querySelectorStub.returns({getAttribute: Sinon.stub().returns(null)}),
          expectedResult: {
            error: "Lipsește codul CSRF",
            kind: "TransportError",
          },
        },
        "when the response body is not parseable JSON": {
          setup: () =>
            fetchStub.resolves({
              status: 200,
              json: Sinon.stub().rejects(new SyntaxError("JSON Parse error: Something’s fishy")),
            }),
          expectedResult: {
            error: "Nu înțeleg răspunsul de la server (parsare JSON).",
            kind: "TransportError",
          },
        },
        "when the response is a JSON error": {
          setup: () => fetchStub.resolves({status: 500, json: Sinon.stub().resolves({error: "Something broke"})}),
          expectedResult: {
            error: "Eroare neprevăzută de aplicație (Something broke)",
            kind: "ServerError",
          },
        },
        "when fetch fails": {
          setup: () => fetchStub.rejects(new Error("Wi-fi’s down?!")),
          expectedResult: {
            error: "Wi-fi’s down?!",
            kind: "TransportError",
          },
        },
      }).forEach(([description, {setup, expectedResult}]) => {
        context(description, () => {
          beforeEach(setup);

          it("reports the failure", async () => {
            const result = await runScenario("Login", {email: "some@email.com", password: "53cr37"});

            expect(result).to.deep.equal(expectedResult);
          });
        });
      });
    });
  });
});
