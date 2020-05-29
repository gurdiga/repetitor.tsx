import * as EmailUtils from "backend/src/EmailUtils";
import {requireEnvVar} from "backend/src/Env";
import {loadProfile} from "backend/src/Persistence/AccountPersistence";
import {EMAIL_CHANGE_TOKEN_EXPIRATION_TIME} from "backend/src/Persistence/EmailChange";
import {EmailChangeStep1} from "backend/src/ScenarioHandlers/EmailChangeStep1";
import {EmailChangeStep2} from "backend/src/ScenarioHandlers/EmailChangeStep2";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as StringUtils from "backend/src/StringUtils";
import {q, Stub} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import {AccountCreationSuccess} from "shared/src/Model/Account";
import {UserSession} from "shared/src/Model/UserSession";
import {EmailChangeStep1Result} from "shared/src/Scenarios/EmailChangeStep1";
import {EmailChangeStep2Result} from "shared/src/Scenarios/EmailChangeStep2";
import Sinon = require("sinon");

describe("EmailChange", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => (sendEmailStub = Sinon.stub(EmailUtils, "sendEmail")));
  afterEach(() => sendEmailStub.restore());

  describe("step 1", () => {
    describe("unhappy paths", () => {
      Object.entries({
        "when not authenticated": {
          input: {newEmail: ""},
          session: {userId: undefined},
          expectedResult: {kind: "NotAuthenticatedError"},
        },
        "when the new email is incorrect": {
          input: {newEmail: "bad-email"},
          session: {userId: 42, email: "some@email.com"},
          expectedResult: {kind: "EmailError", errorCode: "INCORRECT"},
        },
        "when the new email is the same as the old one": {
          input: {newEmail: "some@email.com"},
          session: {userId: 42, email: "some@email.com"},
          expectedResult: {kind: "EmailIsTheSameError"},
        },
      }).forEach(([description, {input, session, expectedResult}]) => {
        context(description, () => {
          it("reports the failure", async () => {
            expect(await EmailChangeStep1(input, session)).to.deep.equal(expectedResult);
          });
        });
      });
    });

    describe("when the email is syntactically correct and different from the old one", () => {
      let result: EmailChangeStep1Result;
      const session = {userId: 42, email: "some@email.com"};
      const input = {newEmail: "new@email.com"};

      let genRandomStringStub: Stub<typeof StringUtils.genRandomString>;
      beforeEach(() => (genRandomStringStub = Sinon.stub(StringUtils, "genRandomString").returns("token")));
      afterEach(() => genRandomStringStub.restore());

      beforeEach(async () => {
        await Registration({fullName: "Joe DOE", email: session.email, password: "secret"}, session);
        sendEmailStub.resetHistory(); // ignore the registration email
      });

      const token = "8715a02588ff190e";

      beforeEach(async () => {
        genRandomStringStub.returns(token);
        result = await EmailChangeStep1(input, session);
      });

      it("does the work", async () => {
        expect(await getEmailChangeRequest(session.userId)).to.deep.equal(
          {current_email: session.email, new_email: input.newEmail, token},
          "records the email change request"
        );

        const containsTheConfirmationLink = Sinon.match(`${requireEnvVar("APP_URL")}/schimbare-email?token=${token}`);

        expect(
          sendEmailStub,
          "sends a message to the new email address to ask confirmation"
        ).to.have.been.calledOnceWithExactly(input.newEmail, "Schimbare email", containsTheConfirmationLink);

        expect(result).to.deep.equal({kind: "EmailChangeConfirmationRequestSent"}, "reports the success");
      });

      async function getEmailChangeRequest(userId: number) {
        const [row] = await q(`
          SELECT current_email, new_email, token
          FROM email_change_requests
          WHERE user_id = ${userId}
        `);

        return row;
      }
    });
  });

  describe("step2", () => {
    describe("unhappy paths", () => {
      Object.entries({
        "when the token is missing": {
          input: {token: ""},
          expectedResult: {kind: "EmailChangeTokenValidationError", errorCode: "REQUIRED"},
        },
        "when the token has invalid length": {
          input: {token: "c0ffee"},
          expectedResult: {kind: "EmailChangeTokenValidationError", errorCode: "BAD_LENGTH"},
        },
        "when the token has the appropriate length but is not registered in the DB": {
          input: {token: "8715a02588ff190e"},
          expectedResult: {kind: "EmailChangeTokenUnrecognizedError"},
        },
      }).forEach(([description, {input, expectedResult}]) => {
        context(description, () => {
          it("reports the failure", async () => {
            expect(await EmailChangeStep2(input, {})).to.deep.equal(expectedResult);
          });
        });
      });
    });

    describe("happy path", () => {
      describe("when the token is registered in the DB", () => {
        const currentEmail = "some@email.com";
        const newEmail = "new@email.com";

        let userId: number;
        let session: UserSession;
        let result: EmailChangeStep2Result;

        beforeEach(async () => {
          const registrationRequest = {fullName: "Joe DOE", email: currentEmail, password: "secret"};
          const registrationResult = (await Registration(registrationRequest, {})) as AccountCreationSuccess;

          userId = registrationResult.id;
          sendEmailStub.resetHistory(); // ignore the registration email
        });

        let time: Sinon.SinonFakeTimers;
        beforeEach(() => (time = Sinon.useFakeTimers()));
        afterEach(() => time.restore());

        let genRandomStringStub: Stub<typeof StringUtils.genRandomString>;
        beforeEach(() => (genRandomStringStub = Sinon.stub(StringUtils, "genRandomString")));
        afterEach(() => genRandomStringStub.restore());

        const expiredToken = "8715a02588ff1901";
        const currentToken = "8715a02588ff1902";

        beforeEach(async () => {
          genRandomStringStub.onFirstCall().returns(expiredToken);
          await EmailChangeStep1({newEmail}, {userId, email: currentEmail});
          time.tick(EMAIL_CHANGE_TOKEN_EXPIRATION_TIME + 1); // To test expiration of old tokens.

          genRandomStringStub.onSecondCall().returns(currentToken);
          await EmailChangeStep1({newEmail}, {userId, email: currentEmail});

          expect(await getEmailChangeRequestCount()).to.equal(2);
          sendEmailStub.resetHistory(); // ignore the request confirmation emails
        });

        beforeEach(async () => {
          session = {userId, email: currentEmail};
          result = await EmailChangeStep2({token: currentToken}, session);
        });

        it("does the work", async () => {
          const tokens = await getCurrentEmailChangeRequestTokens();
          expect(tokens).not.to.include(expiredToken, "purges the expired token");
          expect(tokens).not.to.include(currentToken, "deletes the verified token");

          expect(await loadProfile(userId)).to.have.property("email", newEmail, "changes the email");
          expect(await q(`SELECT * FROM previous_emails`)).to.deep.equal(
            [{email: currentEmail, user_id: userId, timestamp: Date.now()}],
            "records the email change"
          );
          expect(session.email).to.equal(newEmail, "updates the session");
          expect(result).to.deep.equal({kind: "EmailChangeConfirmed"}, "reports the success");
        });

        async function getEmailChangeRequestCount() {
          const countColumnName = "count";
          const [row] = await q(`
          SELECT COUNT(*) as ${countColumnName}
          FROM email_change_requests
          WHERE current_email = "${currentEmail}"
        `);

          return row[countColumnName];
        }

        async function getCurrentEmailChangeRequestTokens() {
          const rows = await q(`
          SELECT token
          FROM email_change_requests
          WHERE current_email = "${currentEmail}"
        `);

          return rows.map((r) => r.token);
        }
      });
    });
  });
});
