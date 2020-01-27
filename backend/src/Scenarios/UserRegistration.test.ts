import {expect, use} from "chai";
import {runQuery} from "../Utils/Db";
import {hashString} from "../Utils/StringUtils";
import {UserRegistration} from "./UserRegistration";

use(require("chai-as-promised"));

describe("registerUser", () => {
  describe("parameter validation", () => {
    context("when either of the email or password is missing", () => {
      it("throws with the appropriate error message", async () => {
        const params = {email: "", password: "secret", fullName: "John DOE"};

        await expect(UserRegistration(params)).to.eventually.deep.equal({kind: "EmailError", errorCode: "REQUIRED"});
      });

      it("throws with the appropriate error message", async () => {
        const params = {email: "some@email.com", password: "", fullName: "John DOE"};

        await expect(UserRegistration(params)).to.eventually.deep.equal({kind: "PasswordError", errorCode: "REQUIRED"});
      });
    });
  });

  describe("behavior", () => {
    const params = {email: "some@email.com", password: "secret", fullName: "John DOE"};

    context("happy path", () => {
      before(() => UserRegistration(params));
      after(() => runQuery({sql: "DELETE FROM users", params: []}));

      it("adds the appropriate row to the users table", async () => {
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

    context("when there is already a user like that", () => {
      before(() => UserRegistration(params));
      after(() => runQuery({sql: "DELETE FROM users", params: []}));

      it("trows with an appropriate error message", async () => {
        await expect(UserRegistration(params)).to.eventually.deep.equal({kind: "ModelError", errorCode: "EMAIL_TAKEN"});
      });
    });
  });
});
