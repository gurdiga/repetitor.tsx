import {EmailChangeStep1} from "backend/src/ScenarioHandlers/EmailChangeStep1";
import {EmailChangeStep2} from "backend/src/ScenarioHandlers/EmailChangeStep2";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";
import * as StringUtils from "backend/src/Utils/StringUtils";
import {q, Stub} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
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
      let result: EmailChangeStep2Result;

      const token = "8715a02588ff190e";
      let genRandomStringStub: Stub<typeof StringUtils.genRandomString>;
      beforeEach(() => (genRandomStringStub = Sinon.stub(StringUtils, "genRandomString").returns(token)));
      afterEach(() => genRandomStringStub.restore());

      let time: Sinon.SinonFakeTimers;
      beforeEach(() => (time = Sinon.useFakeTimers()));
      afterEach(() => time.restore());

      beforeEach(async () => {
        const session = {userId: 42, email: "some@email.com"};

        await Registration({fullName: "Joe DOE", email: session.email, password: "secret"}, session);

        // To test expiration of old tokens
        // time.now = 1
        // await EmailChangeStep1({newEmail: "new@email.com"}, session);

        await EmailChangeStep1({newEmail: "new@email.com"}, session);
        sendEmailStub.resetHistory(); // ignore the registration and confirmation emails

        result = await EmailChangeStep2({token}, {});
      });

      /**
       * TOTEST:
       * - purges expired tokens
       * - deletes the verified token
       * - changes the email in users table
       * - sends the email
       */

      it("reports the success", async () => {
        expect(result).to.deep.equal({kind: "EmailChangeConfirmed"});
      });
    });
  });
});
