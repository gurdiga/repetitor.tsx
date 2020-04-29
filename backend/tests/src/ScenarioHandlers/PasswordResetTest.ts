import {TOKEN_EXPIRATION_TIME} from "backend/src/Persistence/AccountPersistence";
import {Login} from "backend/src/ScenarioHandlers/Login";
import {PasswordResetStep1} from "backend/src/ScenarioHandlers/PasswordResetStep1";
import {PasswordResetStep2} from "backend/src/ScenarioHandlers/PasswordResetStep2";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";
import {q, Stub} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import {UserSession} from "shared/src/Model/UserSession";
import Sinon = require("sinon");

describe("PasswordReset", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => (sendEmailStub = Sinon.stub(EmailUtils, "sendEmail")));
  afterEach(() => sendEmailStub.restore());

  describe("step 1", () => {
    describe("happy path", () => {
      it("does the work", async () => {
        const email = "some@email.com";

        await Registration({fullName: "Joe DOE", email, password: "secret"}, {});
        sendEmailStub.resetHistory(); // ignore the registration email

        expect(await PasswordResetStep1({email})).to.deep.equal({kind: "TutorPasswordResetEmailSent"});
        expect(await getPasswordResetTokenForEmail(email), "token created").to.exist;

        const {args} = sendEmailStub.firstCall;

        expect(args[0], "notification email address").to.equal(email);
        expect(args[1], "notification email subject").to.contain("Resetarea parolei");
        expect(args[2], "notification email body").to.contain("/resetare-parola?token=");
      });
    });

    describe("unhappy paths", () => {
      Object.entries({
        "when email is missing": {
          input: {email: ""},
          expectedResult: {kind: "EmailError", errorCode: "REQUIRED"},
        },
        "when email is syntactically incorrect": {
          input: {email: "!42!"},
          expectedResult: {kind: "EmailError", errorCode: "INCORRECT"},
        },
        "when the email is not recognized": {
          input: {email: "syntacticallyvalid@email.com"},
          expectedResult: {kind: "UnknownEmailError"},
        },
      }).forEach(([description, {input, expectedResult}]) => {
        context(description, () => {
          it("reports the failure", async () => {
            expect(await PasswordResetStep1(input)).to.deep.equal(expectedResult);
          });
        });
      });
    });
  });

  describe("step 2", () => {
    const email = "some@email.com";
    const newPassword = "secret42";
    let session: UserSession = {};

    describe("happy path", () => {
      let token: string;
      const expiredToken = "EXPIRED";

      beforeEach(async () => {
        await Registration({fullName: "Joe DOE", email, password: "secret"}, {});
        await PasswordResetStep1({email});

        await insertExpiredToken(expiredToken);
        expect(await doesTokenExist(expiredToken)).to.be.true;

        token = await getPasswordResetTokenForEmail(email);
        expect(token).to.exist;

        sendEmailStub.reset(); // ignore emails from TutorRegistration and TutorPasswordResetStep1
        session = {};
      });

      it("does the work", async () => {
        expect(await PasswordResetStep2({token, newPassword}, session)).to.deep.equal({
          kind: "PasswordResetSuccess",
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

        expect(await Login({email, password: newPassword}, {})).to.deep.equal(
          {kind: "LoginCheckSuccess"},
          "can log in with the new password"
        );
      });

      async function insertExpiredToken(token: string): Promise<void> {
        const timestamp = Date.now() - TOKEN_EXPIRATION_TIME - 100;

        await q(`
          INSERT INTO passsword_reset_tokens (user_id, token, timestamp)
          VALUES(42, "${token}", ${timestamp})
        `);
      }

      async function doesTokenExist(token: string): Promise<boolean> {
        const rows = await q(`
          SELECT 1
          FROM passsword_reset_tokens
          WHERE token = "${token}"
        `);

        return rows.length > 0;
      }
    });

    describe("unhappy path", () => {
      Object.entries({
        "when token is missing": {
          input: {token: "", newPassword},
          expectedResult: {kind: "PasswordResetTokenError", errorCode: "REQUIRED"},
        },
        "when the new password is missing": {
          input: {token: "something", newPassword: ""},
          expectedResult: {kind: "PasswordError", errorCode: "REQUIRED"},
        },
        "when both token and the new password are present but the token is not registered": {
          input: {token: "unregistered", newPassword},
          expectedResult: {kind: "PasswordResetTokenUnknownError"},
        },
      }).forEach(([description, {input, expectedResult}]) => {
        context(description, () => {
          it("reports the failure", async () => {
            expect(await PasswordResetStep2(input, session)).to.deep.equal(expectedResult);
          });
        });
      });
    });
  });

  async function getPasswordResetTokenForEmail(email: string): Promise<string> {
    const [row] = await q(`
    SELECT passsword_reset_tokens.token
    FROM users
    LEFT JOIN passsword_reset_tokens ON passsword_reset_tokens.user_id = users.id
    WHERE users.email = "${email}"
  `);

    return row?.token;
  }
});
