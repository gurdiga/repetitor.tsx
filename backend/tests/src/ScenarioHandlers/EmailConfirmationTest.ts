import {expect} from "chai";
import {stubExport, q} from "backend/tests/src/TestHelpers";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import {UserSession} from "shared/src/Model/UserSession";
import {EmailConfirmation} from "backend/src/ScenarioHandlers/EmailConfirmation";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {Registration} from "backend/src/ScenarioHandlers/Registration";

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

  it("validates the token", async () => {
    const result = await EmailConfirmation({token: ""}, session);

    expect(result).to.deep.equal({kind: "EmailConfirmationTokenValidationError", errorCode: "REQUIRED"});
  });

  it("tells when the token is not recognized", async () => {
    const result = await EmailConfirmation({token: "magic42"}, session);

    expect(result).to.deep.equal({kind: "EmailConfirmationTokenUnrecognizedError"});
  });
});
