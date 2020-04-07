import {expect} from "chai";
import {Stub} from "backend/tests/src/TestHelpers";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import Sinon = require("sinon");
import {TutorPasswordResetStep2} from "backend/src/ScenarioHandlers/TutorPasswordResetStep2";
import {TutorRegistration} from "backend/src/ScenarioHandlers/TutorRegistration";
import {TutorPasswordResetStep1} from "backend/src/ScenarioHandlers/TutorPasswordResetStep1";
import {runQuery, RowSet} from "backend/src/Utils/Db";
import {getTokenForEmail} from "backend/tests/src/ScenarioHandlers/Helpers";
import {TOKEN_EXPIRATION_TIME} from "backend/src/Persistence/TutorPersistence";
import {requireEnvVar} from "backend/src/Utils/Env";
import {TutorLogin} from "backend/src/ScenarioHandlers/TutorLogin";
import {UserSession} from "shared/src/Model/UserSession";

describe("TutorPasswordResetStep2", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => (sendEmailStub = Sinon.stub(EmailUtils, "sendEmail")));
  afterEach(() => sendEmailStub.restore());

  const email = "some@email.com";
  const newPassword = "secret42";
  let session: UserSession = {};

  describe("happy path", () => {
    let token: string;
    const expiredToken = "EXPIRED";

    beforeEach(async () => {
      await TutorRegistration({fullName: "Joe DOE", email, password: "secret"}, {});
      await TutorPasswordResetStep1({email});

      await insertExpiredToken(expiredToken);
      expect(await doesTokenExist(expiredToken)).to.be.true;

      token = await getTokenForEmail(email);
      expect(token).to.exist;

      sendEmailStub.reset(); // ignore emails from TutorRegistration and TutorPasswordResetStep1
      session = {};
    });

    it("works", async () => {
      expect(await TutorPasswordResetStep2({token, newPassword}, session)).to.deep.equal({
        kind: "TutorPasswordResetSuccess",
      });

      expect(await doesTokenExist(token), "deletes the used token").to.be.false;
      expect(await doesTokenExist(expiredToken), "purges expired tokens").to.be.false;

      expect(sendEmailStub.calledOnce, "sends notification email").to.be.true;

      const {args} = sendEmailStub.firstCall;
      expect(args[0], "notification email address").to.equal(email);
      expect(args[1], "notification email subject").to.equal("Parola dumneavoastră a fost resetată");
      expect(args[2], "notification email body").to.contain(requireEnvVar("APP_URL"));

      expect(session.email).to.equal(email);
      expect(session.userId).to.exist;

      expect(await TutorLogin({email, password: newPassword}, {})).to.deep.equal(
        {kind: "LoginCheckSuccess"},
        "can log in with the new password"
      );
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
        const result = await TutorPasswordResetStep2({token: "", newPassword}, session);

        expect(result).to.deep.equal({kind: "PasswordResetTokenError", errorCode: "REQUIRED"});
      });
    });

    context("when password is missing", () => {
      it("fails appropriately", async () => {
        const result = await TutorPasswordResetStep2({token: "something", newPassword: ""}, session);

        expect(result).to.deep.equal({kind: "PasswordError", errorCode: "REQUIRED"});
      });
    });

    context("when both token and the new password are present but the token is not registered", () => {
      it("fails appropriately", async () => {
        const result = await TutorPasswordResetStep2({token: "unregistered", newPassword}, session);

        expect(result).to.deep.equal({kind: "PasswordResetTokenUnknownError"});
      });
    });
  });
});
