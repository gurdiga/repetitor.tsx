import {loadProfile} from "backend/src/Persistence/AccountPersistence";
import {EMAIL_CHANGE_TOKEN_EXPIRATION_TIME} from "backend/src/Persistence/EmailChange";
import {EmailChangeStep1} from "backend/src/ScenarioHandlers/EmailChangeStep1";
import {EmailChangeStep2} from "backend/src/ScenarioHandlers/EmailChangeStep2";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";
import * as StringUtils from "backend/src/Utils/StringUtils";
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
    describe("when not authenticated", () => {
      it("reports the failure", async () => {
        const result = await EmailChangeStep1({newEmail: ""}, {userId: undefined});

        expect(result).to.deep.equal({kind: "NotAuthenticatedError"});
      });
    });

    describe("when the new email is incorrect", () => {
      it("reports the failure", async () => {
        const result = await EmailChangeStep1({newEmail: "bad-email"}, {userId: 42, email: "some@email.com"});

        expect(result).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});
      });
    });

    describe("when the new email is the same as the old one", () => {
      it("reports the failure", async () => {
        const result = await EmailChangeStep1({newEmail: "some@email.com"}, {userId: 42, email: "some@email.com"});

        expect(result).to.deep.equal({kind: "EmailIsTheSameError"});
      });
    });

    describe("when the new email is the same as the old one", () => {
      it("reports the failure", async () => {
        const result = await EmailChangeStep1({newEmail: "some@email.com"}, {userId: 42, email: "some@email.com"});

        expect(result).to.deep.equal({kind: "EmailIsTheSameError"});
      });
    });

    describe("whe the email is syntactically correct and different from the old one", () => {
      let result: EmailChangeStep1Result;
      const session = {userId: 42, email: "some@email.com"};
      const input = {newEmail: "new@email.com"};

      const token = "8715a02588ff190e";
      let genRandomStringStub: Stub<typeof StringUtils.genRandomString>;

      beforeEach(() => (genRandomStringStub = Sinon.stub(StringUtils, "genRandomString").returns(token)));
      afterEach(() => genRandomStringStub.restore());

      beforeEach(async () => {
        await Registration({fullName: "Joe DOE", email: session.email, password: "secret"}, session);
        sendEmailStub.resetHistory(); // ignore the registration email
        result = await EmailChangeStep1(input, session);
      });

      it("records the email change request", async () => {
        const [row] = await q(`
          SELECT current_email, new_email, token, timestamp
          FROM email_change_requests
          WHERE user_id = ${session.userId}
        `);

        expect(row, "table row").to.exist;
        expect(row["current_email"]).to.equal(session.email);
        expect(row["new_email"]).to.equal(input.newEmail);
      });

      it("sends a message to the new email address to ask confirmation", () => {
        const containsTheConfirmationLink = Sinon.match(`${requireEnvVar("APP_URL")}/schimbare-email?token=${token}`);

        expect(sendEmailStub).to.have.been.calledOnceWithExactly(
          input.newEmail,
          "Schimbare email",
          containsTheConfirmationLink
        );
      });

      it("reports the success", () => {
        expect(result).to.deep.equal({kind: "EmailChangeConfirmationRequestSent"});
      });
    });
  });

  describe("step2", () => {
    describe("when the token is missing", () => {
      it("reports the failure", async () => {
        const result = await EmailChangeStep2({token: ""}, {});

        expect(result).to.deep.equal({kind: "EmailChangeTokenValidationError", errorCode: "REQUIRED"});
      });
    });

    describe("when the token has invalid length", () => {
      it("reports the failure", async () => {
        const result = await EmailChangeStep2({token: "c0ffee"}, {});

        expect(result).to.deep.equal({kind: "EmailChangeTokenValidationError", errorCode: "BAD_LENGTH"});
      });
    });

    describe("when the token has the appropriate length but is not registered in the DB", () => {
      it("reports the failure", async () => {
        const result = await EmailChangeStep2({token: "8715a02588ff190e"}, {});

        expect(result).to.deep.equal({kind: "EmailChangeTokenUnrecognizedError"});
      });
    });

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
        genRandomStringStub = genRandomStringStub.onFirstCall().returns(expiredToken);
        await EmailChangeStep1({newEmail}, {userId, email: currentEmail});
        time.tick(EMAIL_CHANGE_TOKEN_EXPIRATION_TIME + 1); // To test expiration of old tokens.

        genRandomStringStub = genRandomStringStub.onSecondCall().returns(currentToken);
        await EmailChangeStep1({newEmail}, {userId, email: currentEmail});

        expect(await getEmailChangeRequestCount()).to.equal(2);
        sendEmailStub.resetHistory(); // ignore the request confirmation emails
      });

      beforeEach(async () => {
        session = {userId, email: currentEmail};
        result = await EmailChangeStep2({token: currentToken}, session);
      });

      it("records the email change", async () => {
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
