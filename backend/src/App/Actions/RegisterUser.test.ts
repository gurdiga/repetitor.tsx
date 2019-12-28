import "mocha";
import {expect} from "chai";
import {RegisterUser} from "App/Actions/RegisterUser";
import {runQuery} from "App/DB";
import {hashString} from "App/Utils/StringUtils";

describe("RegisterUser", () => {
  describe("assertValidParams", () => {
    context("when both are present", () => {
      it("does not throw", () => {
        const params = {email: "some@email.com", password: "secret"};

        expect(() => RegisterUser.assertValidParams(params)).not.to.throw;
      });
    });

    context("when either of the email or password is missing", () => {
      it("throws with the appropriate error message", () => {
        const params = {email: "", password: "secret"};

        expect(() => RegisterUser.assertValidParams(params)).to.throw(/Email is required/);
      });

      it("throws with the appropriate error message", () => {
        const params = {email: "some@email.com", password: ""};

        expect(() => RegisterUser.assertValidParams(params)).to.throw(/Password is required/);
      });
    });
  });

  describe("execute", () => {
    const params = {email: "some@email.com", password: "secret"};

    before(() => RegisterUser.execute(params));

    after(() => runQuery({sql: "DELETE FROM users", params: []}));

    it("adds the appropriate record to the users table", async () => {
      const {rows} = await runQuery({sql: "SELECT * FROM users", params: []});
      const row = rows[0];

      if (!row) {
        expect(row).to.exist;
        return;
      }

      expect(row.email, "Row is expected to have the email").to.exist;
      expect(row.password_salt, "Row is expected to have the stored password salt").to.exist;

      const passwordHash = hashString(params.password, row.password_salt as string);
      expect(row.password_hash, "Row is expected to have the hashed password").to.equal(passwordHash);
    });
  });
});
