import * as ErrorLogging from "backend/src/ErrorLogging";
import {
  VendorModulesWebPaths,
  VENDOR_MODULE_PREFIX,
  VersionedVendorModulePaths,
} from "backend/src/Express/VendorModules";
import {app} from "backend/src/index";
import * as ScenarioRunner from "backend/src/ScenarioRunner";
import {Stub} from "backend/tests/src/TestHelpers";
import * as chai from "chai";
import {expect} from "chai";
import {isUploadedFile} from "shared/src/Model/FileUpload";
import * as Sinon from "sinon";
import ChaiHttp = require("chai-http");
import path = require("path");
import fs = require("fs");

const {instanceOf, has, hasNested, array} = Sinon.match;

describe("Express integration", () => {
  let agent: ChaiHttp.Agent;

  before(async () => {
    agent = chai.request.agent(app);
  });

  describe("GET", () => {
    it("does the work", async () => {
      const res = await agent.get("/");

      expect(res, "responds with HTTP OK 200").to.have.status(200);

      const csrfToken = res.header["xsrf-token"];
      const expectedMetaTag = `<meta name="csrf_token" content="${csrfToken}" />`;
      expect(res.text, "includes the CSRF token into the page").to.have.string(expectedMetaTag);

      const expectedStringTag = '<script src="/vendor_modules/requirejs-2.3.6.js"></script>';
      expect(res.text, "includes the reference to the RequireJS loader").to.have.string(expectedStringTag);

      const goldenSampleHtml = `<!DOCTYPE html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf_token" content="${csrfToken}" />
  <meta name="msvalidate.01" content="7349C399D4F768E25C7444A6204D3F13" />
  <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
  <title>Loading…</title>
  <link href="/styles-VERSION.css" rel="stylesheet">
  <link href="/fonts-VERSION.css" rel="stylesheet">
  <script>
    var environment = "test";
  </script>
  <script src="/vendor_modules/rollbar-2.15.2.js"></script>
  <script>
    rollbar.init({
      accessToken: "APP_ROLLBAR_POST_CLIENT_ITEM_TOKEN",
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
          environment: "test"
      }
    });
  </script>
</head>
<body>
  <div id="root"></div>
  <script src="/vendor_modules/requirejs-2.3.6.js"></script>
  <script>
    requirejs.config({
      paths: {
  "react": "/vendor_modules/react-16.13.1",
  "react-dom": "/vendor_modules/react-dom-16.13.1",
  "typestyle": "/vendor_modules/typestyle-2.1.0",
  "csx": "/vendor_modules/csx-10.0.1",
  "csstips": "/vendor_modules/csstips-1.2.0",
  "requirejs": "/vendor_modules/requirejs-2.3.6",
  "rollbar": "/vendor_modules/rollbar-2.15.2"
}
    });

    var sharedBundles = ["/frontend/shared/bundle-VERSION.js","/shared/bundle-VERSION.js"];
    var pageBundle = "/home/bundle-VERSION.js";
    var appBundles = sharedBundles.concat([pageBundle]);

    requirejs(appBundles, function() {
      requirejs(["frontend/pages/home/src/Main"], function(page) {
        page.main({
  "isAuthenticated": false
}, location.search);
      });
    });
  </script>
</body>
`;
      expect(res.text, "renders the golden sample HTML").to.equal(goldenSampleHtml);

      const sessionCookie = res.header["set-cookie"][0];
      const sessionCookieRegexp = /connect.sid=(.+); Path=\/; Expires=(.+); HttpOnly/;

      expect(sessionCookie, "sets the session cookie appropriately").to.match(sessionCookieRegexp);

      const [_wholeMatch, seesionId, expirationTimestamp] = sessionCookie.match(sessionCookieRegexp);

      expect(unescape(seesionId), "seesionId length").to.have.lengthOf(78);

      const oneWeekFromNow = new Date(Date.now() + 1000 * 3600 * 24 * 7);
      const expectedExpirationDate = stripMilliseconds(oneWeekFromNow);
      const actualExpirationDate = stripMilliseconds(new Date(expirationTimestamp));

      expect(actualExpirationDate, "session cookie expiration date").to.equal(expectedExpirationDate);

      const goldenSampleHeaders = {
        "x-dns-prefetch-control": "off",
        "x-frame-options": "SAMEORIGIN",
        "strict-transport-security": "max-age=15552000; includeSubDomains",
        "x-download-options": "noopen",
        "x-content-type-options": "nosniff",
        "x-xss-protection": "1; mode=block",
        "access-control-allow-origin": "*",
        "content-type": "text/html; charset=utf-8",
        vary: "Accept-Encoding",
        connection: "close",
      };

      expect(res.header, "headers").to.deep.include(goldenSampleHeaders);
    });

    it("responds to /.well-known/security.txt", async () => {
      const res = await agent.get("/.well-known/security.txt");

      expect(res).to.have.status(200);
      expect(res.text).to.equal(
        [`# If you found any security issue, please let me know.`, `Contact: mailto:gurdiga@gmail.com`].join("\n")
      );
    });

    describe("serving of vendor modules", () => {
      it("correctly computes the golden samples", () => {
        expect(VersionedVendorModulePaths).to.deep.equal({
          "react-16.13.1.js": "frontend/node_modules/react/umd/react.production.min.js",
          "react-dom-16.13.1.js": "frontend/node_modules/react-dom/umd/react-dom.production.min.js",
          "typestyle-2.1.0.js": "frontend/node_modules/typestyle/umd/typestyle.min.js",
          "csx-10.0.1.js": "frontend/node_modules/csx/umd/csx.min.js",
          "csstips-1.2.0.js": "frontend/node_modules/csstips/umd/csstips.min.js",
          "requirejs-2.3.6.js": "frontend/node_modules/requirejs/require.js",
          "rollbar-2.15.2.js": "frontend/node_modules/rollbar/dist/rollbar.umd.min.js",
        });

        expect(VendorModulesWebPaths).to.deep.equal({
          react: `/vendor_modules/react-16.13.1`,
          "react-dom": `/vendor_modules/react-dom-16.13.1`,
          typestyle: `/vendor_modules/typestyle-2.1.0`,
          csx: `/vendor_modules/csx-10.0.1`,
          csstips: `/vendor_modules/csstips-1.2.0`,
          rollbar: "/vendor_modules/rollbar-2.15.2",
          requirejs: `/vendor_modules/requirejs-2.3.6`,
        });
      });

      it("serves the ones that exis", () => {
        Object.keys(VersionedVendorModulePaths).forEach(async (module) => {
          const res = await agent.get(`${VENDOR_MODULE_PREFIX}${module}`);

          expect(res).to.have.status(200);
          expect(res).to.have.header("content-type", "application/javascript; charset=UTF-8");
          expect(res, "caches them indefinitely").to.have.header("cache-control", "public, max-age=31536000");
        });
      });

      it("responds with 404 for the ones that do not exist", async () => {
        const res = await agent.get(`${VENDOR_MODULE_PREFIX}nonexistent.js`);

        expect(res).to.be.text;
        expect(res).to.have.status(404);
      });

      it("responds with an empty reponse for Rollbar module sourcemap because it’s making it too hard to also serve the source-maps", async () => {
        const res = await agent.get(`${VENDOR_MODULE_PREFIX}rollbar.umd.min.js.map`);

        expect(res).to.have.status(200);
        expect(res).to.have.header("content-type", "text/plain; charset=utf-8");
        expect(res.body).to.be.empty;
      });
    });

    describe("serving of app bundles", () => {
      it("serves the ones that exis", async () => {
        [
          "/shared/bundle-VERSION.js",
          "/frontend/shared/bundle-VERSION.js",
          "/home/bundle-VERSION.js",
          "/autentificare/bundle-VERSION.js",
        ].forEach(async (bundle) => {
          const res = await agent.get(bundle);

          expect(res).to.have.header("content-type", "application/javascript; charset=UTF-8");
          expect(res, "caches them indefinitely").to.have.header("cache-control", "public, max-age=31536000");
          expect(res).to.have.status(200);
        });
      });

      it("responds with 404 for the ones that do not exist", async () => {
        const res = await agent.get("/nonexistent/bundle-VERSION.js");

        expect(res).to.be.text;
        expect(res).to.have.status(404);
      });
    });

    it("responds with 404 on non-existend paths", async () => {
      const res = await agent.get("/nonexistent/");

      expect(res).to.be.text;
      expect(res).to.have.status(404);
    });

    it("trusts the reverse proxy", () => {
      expect(app.enabled("trust proxy")).to.be.true;
    });

    it("has the appropriate middleware set", () => {
      const middlewareNames = app._router.stack.map((layer: any) => layer.name);

      expect(middlewareNames).to.include("session");
      expect(middlewareNames).to.include("compression");
      expect(middlewareNames).to.include("jsonParser");
      expect(middlewareNames).to.include("corsMiddleware");
      expect(middlewareNames).to.include("helmet");

      // CSRF protection, error logging, and file upload parsing are tested in the context of handlePost.
    });
  });

  describe("handlePost", () => {
    let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
    beforeEach(() => (runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario")));
    afterEach(() => runScenarioStub.restore());

    describe("happy path", () => {
      const scenarioName = "TestScenario";
      const scenarioInput = {one: 1, two: 2};

      const hasNoProps = Sinon.match((value) => Object.keys(value).length === 0, "hasNoProps");
      const expectedSession = instanceOf(Object).and(hasNoProps);

      context("when the request is JSON", () => {
        it("runs the scenario and responds with its output", async () => {
          const res = await simulateJsonPost({scenarioName, scenarioInput});

          expect(runScenarioStub).to.have.been.calledOnceWithExactly(expectedSession, scenarioName, scenarioInput);
          expect(res).to.have.status(200);
        });
      });

      context("when request is a form upload", () => {
        it("runs the scenario and responds with its output", async () => {
          const file = __filename;
          const expectedInput = instanceOf(Object)
            .and(has("one", scenarioInput["one"]))
            .and(has("two", scenarioInput["two"]))
            .and(hasNested("upload[0].destination", "uploads/"))
            .and(hasNested("upload[0].fieldname", "files"))
            .and(hasNested("upload[0].mimetype", "video/mp2t")) // because .ts is recognized as MPEG Transport Stream (TS) by MIME library
            .and(hasNested("upload[0].size", fs.statSync(file)["size"]))
            .and(hasNested("upload[0].originalname", path.basename(file)));

          const res = await simulateFormUploadPost([file], {
            scenarioName,
            scenarioInput: JSON.stringify(scenarioInput),
          });

          expect(runScenarioStub).to.have.been.calledOnceWithExactly(expectedSession, scenarioName, expectedInput);
          expect(isUploadedFile(runScenarioStub.firstCall.args[2].upload[0])).to.be.true;
          expect(res).to.have.status(200);
        });
      });
    });

    describe("unhappy paths", () => {
      let logErrorStub: Stub<typeof ErrorLogging.logError>;
      beforeEach(() => (logErrorStub = Sinon.stub(ErrorLogging, "logError")));
      afterEach(() => logErrorStub.restore());

      context("when request is a form upload", () => {
        context("when the scenarioInput form field is not a valid JSON string", () => {
          it("responds with JSON 500 SCENARIO_INPUT_ERROR", async () => {
            const res = await simulateFormUploadPost([__filename], {
              scenarioName: "TestScenario",
              scenarioInput: "some non-JSON blob",
            });

            expect(res, "responds with HTTP 500").to.have.status(500);
            expect(res.body).to.deep.equal({error: "SCENARIO_INPUT_ERROR"});

            const expectedError = instanceOf(Error).and(has("message", "Unable to parse scenario input JSON"));
            const expectedErrorData = {context: "getScenarioInput", scenarioName: "TestScenario"};
            expect(logErrorStub).to.have.been.calledOnceWithExactly(expectedError, expectedErrorData);
          });
        });

        context("when the scenarioInput form field is valid JSON but not object", () => {
          ["[]", "1", "null", '"string"', "false"].forEach((invalidInput) => {
            it("responds with JSON 500 SCENARIO_INPUT_ERROR", async () => {
              const res = await simulateFormUploadPost([__filename], {
                scenarioName: "TestScenario",
                scenarioInput: invalidInput,
              });

              expect(res, "responds with HTTP 500").to.have.status(500);
              expect(res.body).to.deep.equal({error: "SCENARIO_INPUT_ERROR"});

              const expectedError = instanceOf(Error).and(has("message", "Scenario input is expected to be an object"));
              const expectedErrorData = {context: "getScenarioInput", scenarioName: "TestScenario"};
              expect(logErrorStub).to.have.been.calledOnceWithExactly(expectedError, expectedErrorData);
            });
          });
        });
      });

      context("when request is JSON", () => {
        context("when the scenarioInput property is not an object", () => {
          [[], 1, null, "string", false, undefined].forEach((invalidInput) => {
            it("responds with JSON 500 SCENARIO_INPUT_ERROR", async () => {
              const res = await simulateJsonPost({
                scenarioName: "TestScenario",
                scenarioInput: invalidInput,
              });

              expect(res, "responds with HTTP 500").to.have.status(500);
              expect(res.body).to.deep.equal({error: "SCENARIO_INPUT_ERROR"});

              const expectedError = instanceOf(Error).and(has("message", "Scenario input is expected to be an object"));
              const expectedErrorData = {context: "getScenarioInput", scenarioName: "TestScenario"};
              expect(logErrorStub).to.have.been.calledOnceWithExactly(expectedError, expectedErrorData);
            });
          });
        });
      });

      context("when input is OK, but scenario handler fails", () => {
        beforeEach(() => runScenarioStub.throws(new Error("Beep!")));

        it("responds with JSON 500 SCENARIO_EXECUTION_ERROR", async () => {
          const res = await simulateFormUploadPost([__filename], {
            scenarioName: "TestScenario",
            scenarioInput: "{}",
          });

          expect(res, "responds with HTTP 500").to.have.status(500);
          expect(res.body).to.deep.equal({error: "SCENARIO_EXECUTION_ERROR"});

          const expectedError = instanceOf(Error).and(has("message", "Beep!"));
          const expectedErrorData = {context: "runScenario", scenarioName: "TestScenario"};
          expect(logErrorStub).to.have.been.calledOnceWithExactly(expectedError, expectedErrorData);
        });
      });
    });

    describe("CSRF validation", () => {
      let errorLoggingMiddlewareStub: Stub<typeof ErrorLogging.errorLoggingMiddleware>;
      beforeEach(() => (errorLoggingMiddlewareStub = Sinon.stub(ErrorLogging, "errorLoggingMiddleware").callsArg(3)));
      afterEach(() => errorLoggingMiddlewareStub.restore());

      context("when the request is a form upload", () => {
        it("responds with 403 if invalid", async () => {
          const res = await simulateFormUploadPost([__filename], {
            scenarioName: "TestScenario",
            scenarioInput: "some non-JSON blob",
            _csrf: "abracadabra",
          });

          expect(res).to.have.status(403);
        });

        it("responds with 200 if valid", async () => {
          const res = await simulateFormUploadPost([__filename], {
            scenarioName: "TestScenario",
            scenarioInput: "{}",
            // When not specified _csrf is set to a valid value inside this helper function
          });

          expect(res).to.have.status(200);
        });
      });

      context("when the request is JSON", () => {
        it("responds with 403 if invalid", async () => {
          const res = await simulateJsonPost({
            scenarioName: "TestScenario",
            scenarioInput: {},
            _csrf: "abracadabra",
          });

          expect(res).to.have.status(403);
        });

        it("responds with 200 if valid", async () => {
          const res = await simulateJsonPost({
            scenarioName: "TestScenario",
            scenarioInput: {},
          });

          expect(res).to.have.status(200);
        });
      });
    });

    async function simulateFormUploadPost(
      filePaths: string[],
      formFields: Record<string, string>
    ): Promise<ChaiHttp.Response> {
      const csrfToken = (await agent.get("/")).header["xsrf-token"];

      formFields = {_csrf: csrfToken, ...formFields};

      let req = agent.post("/");

      filePaths.forEach((filePath) => {
        req = req.attach("files", filePath);
      });

      Object.entries(formFields).forEach(([fieldName, fieldValue]) => {
        req = req.field(fieldName, fieldValue);
      });

      return await req;
    }

    async function simulateJsonPost(data: object): Promise<ChaiHttp.Response> {
      const csrfToken = (await agent.get("/")).header["xsrf-token"];

      data = {_csrf: csrfToken, ...data};

      return await agent.post("/").type("json").send(data);
    }
  });

  function stripMilliseconds(d: Date): string {
    d.setSeconds(0, 0);
    return d.toISOString();
  }
});
