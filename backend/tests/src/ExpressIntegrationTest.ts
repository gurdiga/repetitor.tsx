import * as chai from "chai";
import {expect} from "chai";
import {app} from "index";

describe("Express integration", () => {
  let agent: ChaiHttp.Agent;

  before(() => {
    agent = chai.request.agent(app);
  });

  it("includes the CSRF token into the page", () => {
    return agent.get("/").then(res => {
      const csrfToken = res.get("XSRF-TOKEN");
      const expectedTag = `<meta name="csrf_token" content="${csrfToken}" />`;

      expect(res.text).to.have.string(expectedTag);
      expect(res).to.have.status(200);
    });
  });
});
