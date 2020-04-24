import {EmailChangeStep1} from "backend/src/ScenarioHandlers/EmailChangeStep1";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import {q, stubExport} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import {EmailChangeStep1Result} from "shared/src/Scenarios/EmailChangeStep1";

describe("EmailChange", () => {
  stubExport(EmailUtils, "sendEmail", before, after);

  describe("step 1", () => {
    describe("when not authenticated", () => {
      it("tells", async () => {
        const result = await EmailChangeStep1({newEmail: ""}, {userId: undefined});

        expect(result).to.deep.equal({kind: "NotAuthenticatedError"});
      });
    });

    describe("when the new email is incorrect", () => {
      it("tells", async () => {
        const result = await EmailChangeStep1({newEmail: "bad-email"}, {userId: 42, email: "some@email.com"});

        expect(result).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});
      });
    });

    describe("when the new email is the same as the old one", () => {
      it("tells", async () => {
        const result = await EmailChangeStep1({newEmail: "some@email.com"}, {userId: 42, email: "some@email.com"});

        expect(result).to.deep.equal({kind: "EmailIsTheSameError"});
      });
    });

    describe("when the new email is the same as the old one", () => {
      it("tells", async () => {
        const result = await EmailChangeStep1({newEmail: "some@email.com"}, {userId: 42, email: "some@email.com"});

        expect(result).to.deep.equal({kind: "EmailIsTheSameError"});
      });
    });

    describe("whe the email is syntactically correct and different from the old one", () => {
      let result: EmailChangeStep1Result;
      const session = {userId: 42, email: "some@email.com"};
      const input = {newEmail: "new@email.com"};

      beforeEach(async () => {
        await Registration({fullName: "Joe DOE", email: session.email, password: "secret"}, session);
        result = await EmailChangeStep1(input, session);
      });

      it("records the email change request", async () => {
        expect(result).to.deep.equal({kind: "EmailChangeConfirmationRequestSent"});

        const [row] = await q(`
          SELECT current_email, new_email, token, timestamp
          FROM email_change_requests
          WHERE user_id = ${session.userId}
        `);

        expect(row, "table row").to.exist;
        expect(row["current_email"]).to.equal(session.email);
        expect(row["new_email"]).to.equal(input.newEmail);
        // TODO: finish this
      });
    });
  });
});
