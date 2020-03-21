import {expect} from "chai";
import {Stub, truncateTables} from "backend/tests/src/TestHelpers";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import Sinon = require("sinon");
import {TutorPasswordResetStep2} from "backend/src/ScenarioHandlers/TutorPasswordResetStep2";
import {TutorRegistration} from "backend/src/ScenarioHandlers/TutorRegistration";
import {TutorPasswordResetStep1} from "backend/src/ScenarioHandlers/TutorPasswordResetStep1";
import {runQuery, RowSet} from "backend/src/Utils/Db";
import {getTokenForEmail} from "backend/tests/src/ScenarioHandlers/Helpers";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {TOKEN_EXPIRATION_TIME} from "backend/src/Persistence/TutorPersistence";

describe("TutorPasswordResetStep2", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => {
    sendEmailStub = Sinon.stub(EmailUtils, "sendEmail");
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  afterEach(() => truncateTables(["users", "passsword_reset_tokens"]));

  const email = "some@email.com";
  const newPassword = "secret42";

  describe("happy path", () => {
    let token: string;
    let result: ScenarioRegistry["TutorPasswordResetStep2"]["Result"];
    const expiredToken = "EXPIRED";

    before(async () => {
      await TutorRegistration({fullName: "Joe DOE", email, password: "secret"}, {});
      await TutorPasswordResetStep1({email});
      await insertExpiredToken(expiredToken);

      expect(await doesTokenExist(expiredToken)).to.be.true;

      token = await getTokenForEmail(email);
      result = await TutorPasswordResetStep2({token, newPassword});
    });

    it("has the successful outcome", async () => {
      expect(result).to.deep.equal({kind: "TutorPasswordResetSuccess"});
    });

    it("deletes the token", async () => {
      token = await getTokenForEmail(email);
      expect(token).not.to.exist;
    });

    it("purges the expired tokens", async () => {
      const doesExpiredTokenExist = await doesTokenExist(expiredToken);

      expect(doesExpiredTokenExist, "the expired token no longer exist").to.be.false;
    });

    async function insertExpiredToken(token: string): Promise<void> {
      const timestamp = Date.now() - TOKEN_EXPIRATION_TIME - 100;

      await runQuery({
        sql: `
              INSERT INTO passsword_reset_tokens (user_id, token, timestamp)
              VALUES(?, ?, ?)
             `,
        params: [42, token, timestamp],
      });
    }

    async function doesTokenExist(token: string): Promise<boolean> {
      const result = (await runQuery({
        sql: `
                SELECT 1
                FROM passsword_reset_tokens
                WHERE token = ?
              `,
        params: [token],
      })) as RowSet;

      return result.rows.length > 0;
    }
  });

  describe("unhappy path", () => {
    context("when token is missing", () => {
      it("fails appropriately", async () => {
        const result = await TutorPasswordResetStep2({token: "", newPassword});

        expect(result).to.deep.equal({
          kind: "PasswordResetTokenError",
          errorCode: "REQUIRED",
        });
      });
    });

    context("when password is missing", () => {
      it("fails appropriately", async () => {
        const result = await TutorPasswordResetStep2({token: "something", newPassword: ""});

        expect(result).to.deep.equal({
          kind: "PasswordError",
          errorCode: "REQUIRED",
        });
      });
    });

    context("when both token and the new password are present but the token is not registered", () => {
      it("fails appropriately", async () => {
        const result = await TutorPasswordResetStep2({token: "unregistered", newPassword});

        expect(result).to.deep.equal({
          kind: "PasswordResetTokenUnknownError",
        });
      });
    });
  });
});
