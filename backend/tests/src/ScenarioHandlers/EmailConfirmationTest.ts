import {EmailConfirmation} from "backend/src/ScenarioHandlers/EmailConfirmation";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as EmailUtils from "backend/src/EmailUtils";
import {q, stubExport} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

describe("EmailConfirmation", () => {
  const session: UserSession = {userId: undefined};

  stubExport(EmailUtils, "sendEmail", before, after);

  describe("happy path", () => {
    let result: ScenarioRegistry["EmailConfirmation"]["Result"];
    let userId: number;
    const email = "some@email.com";

    beforeEach(async () => {
      await Registration({fullName: "Joe DOE", email, password: "secret"}, session);
      userId = session.userId!;
      expect(userId).to.exist;

      const token = await getEmailConfirmationTokenForUser(userId);

      session.userId = undefined;
      result = await EmailConfirmation({token}, session);
    });

    it("reports success and initializes the user session", () => {
      expect(result, "result").to.deep.equal({kind: "EmailConfirmed", userId, email});

      expect(session.userId, "session userId").to.equal(userId);
      expect(session.email, "session email").to.equal(email);
    });

    async function getEmailConfirmationTokenForUser(userId: number): Promise<string> {
      const rows = await q(`
        SELECT email_confirmation_token
        FROM users
        WHERE id = ${userId}
      `);

      return rows[0].email_confirmation_token;
    }
  });

  describe("unhappy paths", () => {
    Object.entries({
      "when the token is missing": {
        input: {token: ""},
        expectedResult: {kind: "EmailConfirmationTokenValidationError", errorCode: "REQUIRED"},
      },
      "when the token is not recognized": {
        input: {token: "magic42"},
        expectedResult: {kind: "EmailConfirmationTokenUnrecognizedError"},
      },
    }).forEach(([description, {input, expectedResult}]) => {
      context(description, () => {
        it("reports the failure", async () => {
          expect(await EmailConfirmation(input, session)).to.deep.equal(expectedResult);
        });
      });
    });
  });
});
