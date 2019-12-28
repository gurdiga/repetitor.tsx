import "mocha";
import {expect} from "chai";
import {RegisterUser} from "App/Actions/RegisterUser";
// import {runQuery} from "App/DB";

describe("RegisterUser", () => {
  describe("assertValidParams", () => {
    it("works", () => {
      const params = {email: "some@email.com", password: "secret"};

      expect(() => {
        RegisterUser.assertValidParams(params);
      }).not.to.throw;
    });
  });

  describe("execute", () => {
    // before(() => {});

    // after(() =>
    //   runQuery({
    //     sql: "DELETE FROM users",
    //     params: [],
    //   })
    // );

    it("runs", () => {
      expect(RegisterUser.execute).to.exist;
    });
  });
});
