import * as chai from "chai";
import {expect} from "chai";
import {app} from "backend/src/index";
import ChaiHttp = require("chai-http");
import {
  versionedVendorModulePaths,
  VENDOR_MODULE_PREFIX,
  webPathsForVendorModules,
} from "backend/src/Utils/Express/Adapter";

describe("Express integration", () => {
  let agent: ChaiHttp.Agent;
  let res: ChaiHttp.Response;

  before(async () => {
    agent = chai.request.agent(app);
    res = await agent.get("/");
  });

  it("responds with HTTP OK 200", () => {
    expect(res).to.have.status(200);
  });

  it("includes the CSRF token into the page", () => {
    const csrfToken = res.header["xsrf-token"];
    const expectedTag = `<meta name="csrf_token" content="${csrfToken}" />`;

    expect(res.text).to.have.string(expectedTag);
  });

  it("includes the reference to the RequireJS loader", () => {
    const expectedTag = '<script src="/vendor_modules/requirejs-2.3.6.js"></script>';

    expect(res.text).to.have.string(expectedTag);
  });

  it("renders the golden sample HTML", () => {
    const csrfToken = res.header["xsrf-token"];
    const goldenSampleHtml = `<!DOCTYPE html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf_token" content="${csrfToken}" />
  <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
  <title>Loading…</title>
  <script>
    var environment = "test";
  </script>
  <script src="/vendor_modules/rollbar-2.15.0.js"></script>
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
  "react": "/vendor_modules/react-16.13.0",
  "react-dom": "/vendor_modules/react-dom-16.13.0",
  "typestyle": "/vendor_modules/typestyle-2.0.4",
  "csx": "/vendor_modules/csx-10.0.1",
  "csstips": "/vendor_modules/csstips-1.2.0",
  "requirejs": "/vendor_modules/requirejs-2.3.6",
  "rollbar": "/vendor_modules/rollbar-2.15.0"
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

    expect(res.text).to.equal(goldenSampleHtml);
  });

  it("sets the session cookie appropriately", () => {
    const sessionCookie = res.header["set-cookie"][0];
    const sessionCookieRegexp = /connect.sid=(.+); Path=\/; Expires=(.+); HttpOnly; SameSite=Strict/;

    expect(sessionCookie).to.match(sessionCookieRegexp);

    const [_wholeMatch, seesionId, expirationTimestamp] = sessionCookie.match(sessionCookieRegexp);

    expect(unescape(seesionId)).to.have.lengthOf(78);

    const oneWeekFromNow = new Date(Date.now() + 1000 * 3600 * 24 * 7);
    const expectedExpirationDate = stripMilliseconds(oneWeekFromNow);
    const actualExpirationDate = stripMilliseconds(new Date(expirationTimestamp));

    expect(actualExpirationDate).to.equal(expectedExpirationDate);
  });

  it("sets the expected headers on the response", () => {
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
    res = await agent.get("/.well-known/security.txt");

    expect(res).to.have.status(200);
    expect(res.text).to.equal(
      [`# If you found any security issue, please let me know.`, `Contact: mailto:gurdiga@gmail.com`].join("\n")
    );
  });

  describe("serving of vendor modules", () => {
    it("correctly computes the golden samples", () => {
      expect(versionedVendorModulePaths).to.deep.equal({
        "react-16.13.0.js": "/Users/vlad/src/repetitor.tsx/frontend/node_modules/react/umd/react.production.min.js",
        "react-dom-16.13.0.js":
          "/Users/vlad/src/repetitor.tsx/frontend/node_modules/react-dom/umd/react-dom.production.min.js",
        "typestyle-2.0.4.js": "/Users/vlad/src/repetitor.tsx/frontend/node_modules/typestyle/umd/typestyle.min.js",
        "csx-10.0.1.js": "/Users/vlad/src/repetitor.tsx/frontend/node_modules/csx/umd/csx.min.js",
        "csstips-1.2.0.js": "/Users/vlad/src/repetitor.tsx/frontend/node_modules/csstips/umd/csstips.min.js",
        "requirejs-2.3.6.js": "/Users/vlad/src/repetitor.tsx/frontend/node_modules/requirejs/require.js",
        "rollbar-2.15.0.js": "/Users/vlad/src/repetitor.tsx/frontend/node_modules/rollbar/dist/rollbar.umd.min.js",
      });

      expect(webPathsForVendorModules).to.deep.equal({
        react: `/vendor_modules/react-16.13.0`,
        "react-dom": `/vendor_modules/react-dom-16.13.0`,
        typestyle: `/vendor_modules/typestyle-2.0.4`,
        csx: `/vendor_modules/csx-10.0.1`,
        csstips: `/vendor_modules/csstips-1.2.0`,
        rollbar: "/vendor_modules/rollbar-2.15.0",
        requirejs: `/vendor_modules/requirejs-2.3.6`,
      });
    });

    it("serves the ones that exis", () => {
      Object.keys(versionedVendorModulePaths).forEach(async module => {
        res = await agent.get(`${VENDOR_MODULE_PREFIX}${module}`);

        expect(res).to.have.status(200);
        expect(res).to.have.header("content-type", "application/javascript; charset=UTF-8");
        expect(res, "caches them indefinitely").to.have.header("cache-control", "public, max-age=31536000");
      });
    });

    it("responds with 404 for the ones that do not exist", async () => {
      res = await agent.get(`${VENDOR_MODULE_PREFIX}nonexistent.js`);

      expect(res).to.be.text;
      expect(res).to.have.status(404);
    });
  });

  describe("serving of page bundles", () => {
    it("serves the ones that exis", async () => {
      ["/bundle-VERSION.js", "/autentificare/bundle-VERSION.js"].forEach(async bundle => {
        res = await agent.get(bundle);

        expect(res).to.have.header("content-type", "application/javascript; charset=UTF-8");
        expect(res, "caches them indefinitely").to.have.header("cache-control", "public, max-age=31536000");
        expect(res).to.have.status(200);
      });
    });

    it("responds with 404 for the ones that do not exist", async () => {
      res = await agent.get("/nonexistent/bundle-VERSION.js");

      expect(res).to.be.text;
      expect(res).to.have.status(404);
    });
  });

  it("responds with 404 on non-existend paths", async () => {
    res = await agent.get("/nonexistent/");

    expect(res).to.be.text;
    expect(res).to.have.status(404);
  });

  it("trusts the reverse proxy", () => {
    expect(app.enabled("trust proxy")).to.be.true;
  });

  it("is inspectable", () => {
    const middlewareNames = app._router.stack.map((layer: any) => layer.name);
    const expectedMiddlewareNames = [
      "errorLoggingMiddleware",
      "helmet",
      "session",
      "compression",
      "jsonParser",
      "corsMiddleware",
    ];

    expect(middlewareNames).to.include.members(expectedMiddlewareNames);
  });

  function stripMilliseconds(d: Date): string {
    d.setSeconds(0, 0);
    return d.toISOString();
  }
});
