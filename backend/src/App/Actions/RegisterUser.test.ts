import "mocha";
import {expect, use} from "chai";

import {runQuery} from "../Db";
import {RegisterUser} from "./RegisterUser";
import {hashString} from "../Utils/StringUtils";

use(require("chai-as-promised"));

describe("registerUser", () => {
  describe("parameter validation", () => {
    context("when both are present", () => {
      after(() => runQuery({sql: "DELETE FROM users", params: []}));

      it("does not throw", async () => {
        const params = {email: "some@email.com", password: "secret", fullName: "John DOE"};

        await expect(RegisterUser(params)).to.be.fulfilled;
      });
    });

    context("when either of the email or password is missing", () => {
      it("throws with the appropriate error message", async () => {
        const params = {email: "", password: "secret", fullName: "John DOE"};

        await expect(RegisterUser(params)).to.be.rejectedWith("Email is required");
      });

      it("throws with the appropriate error message", async () => {
        const params = {email: "some@email.com", password: "", fullName: "John DOE"};

        await expect(RegisterUser(params)).to.be.rejectedWith("Password is required");
      });
    });
  });

  describe("behavior", () => {
    const params = {email: "some@email.com", password: "secret", fullName: "John DOE"};

    context("happy path", () => {
      before(() => RegisterUser(params));
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
      before(() => RegisterUser(params));
      after(() => runQuery({sql: "DELETE FROM users", params: []}));

      it("trows with an appropriate error message", async () => {
        await expect(RegisterUser(params)).to.be.rejectedWith("EMAIL_TAKEN");
      });
    });
  });
});
