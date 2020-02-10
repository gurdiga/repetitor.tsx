import * as chai from "chai";
import {expect} from "chai";
import {app} from "index";
import ChaiHttp = require("chai-http");

describe("Express integration", () => {
  let agent: ChaiHttp.Agent;
  let res: ChaiHttp.Response;

  before(async () => {
    agent = chai.request.agent(app);
    res = await agent.get("/");
  });

  it("includes the CSRF token into the page", () => {
    const csrfToken = res.header["xsrf-token"];
    const expectedTag = `<meta name="csrf_token" content="${csrfToken}" />`;

    expect(res.text).to.have.string(expectedTag);
  });

  it("sets the expected headers on the response", () => {
    // golden sample
    const expectedHeaders = {
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

    expect(res.header, "headers").to.deep.include(expectedHeaders);
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

  it("responds with HTTP OK 200", () => {
    expect(res).to.have.status(200);
  });

  it("responds to /.well-known/security.txt", async () => {
    res = await agent.get("/.well-known/security.txt");

    expect(res).to.have.status(200);
    expect(res.text).to.equal(
      [`# If you found any security issue, please let me know.`, `Contact: mailto:gurdiga@gmail.com`].join("\n")
    );
  });

  describe("serving of vendor UMD modules", () => {
    it("serves the ones that exis", async () => {
      ["react-dom.production.min", "react-dom.production.min", "typestyle.min", "csx.min", "csstips.min"].forEach(
        async module => {
          res = await agent.get(`/umd_node_modules/${module}.js`);

          expect(res).to.have.header("content-type", "application/javascript; charset=UTF-8");
          expect(res).to.have.status(200);
        }
      );
    });

    it("responds with 404 for the ones that do not exist", async () => {
      res = await agent.get(`/umd_node_modules/nonexistent.js`);

      expect(res).to.be.text;
      expect(res).to.have.status(404);
    });
  });

  describe("serving of page bundles", () => {
    it("serves the ones that exis", async () => {
      ["/bundle.js", "/autentificare-repetitor/bundle.js"].forEach(async bundle => {
        res = await agent.get(bundle);

        expect(res).to.have.header("content-type", "application/javascript; charset=UTF-8");
        expect(res).to.have.status(200);
      });
    });

    it("responds with 404 for the ones that do not exist", async () => {
      res = await agent.get("/nonexistent/bundle.js");

      expect(res).to.be.text;
      expect(res).to.have.status(404);
    });
  });

  it("responds with 404 on non-existend paths", async () => {
    res = await agent.get("/nonexistent");

    expect(res).to.be.text;
    expect(res).to.have.status(404);
  });

  it("trusts the reverse proxy", () => {
    expect(app.enabled("trust proxy")).to.be.true;
  });

  it("is inspectable", () => {
    const middlewareNames = app._router.stack.map((layer: any) => layer.name);
    const expectedMiddlewareNames = ["helmet", "logger", "session", "compression", "jsonParser", "corsMiddleware"];

    expect(middlewareNames).to.include.members(expectedMiddlewareNames);
  });

  function stripMilliseconds(d: Date): string {
    d.setSeconds(0, 0);
    return d.toISOString();
  }
});
