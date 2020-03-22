import {expect} from "chai";
import {TutorRegistration} from "backend/src/ScenarioHandlers/TutorRegistration";
import {UserSession} from "shared/src/Model/UserSession";
import {stubExport} from "backend/tests/src/TestHelpers";
import {RowSet, runQuery, DataRow} from "backend/src/Utils/Db";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import {hashString} from "backend/src/Utils/StringUtils";
import {TutorCreationSuccess} from "shared/src/Model/Tutor";
import * as Logging from "backend/src/Utils/Logging";

describe("TutorRegistration", () => {
  stubExport(EmailUtils, "sendEmail", before, after);

  describe("parameter validation", () => {
    context("when either of the email or password is missing", () => {
      it("throws with the appropriate error message", async () => {
        const session = {userId: undefined};
        const params = {email: "", password: "secret", fullName: "John DOE"};
        const result = await TutorRegistration(params, session);

        expect(result).to.deep.equal({
          kind: "EmailError",
          errorCode: "REQUIRED",
        });
      });

      it("throws with the appropriate error message", async () => {
        const session = {userId: undefined};
        const params = {email: "some@email.com", password: "", fullName: "John DOE"};
        const result = await TutorRegistration(params, session);

        expect(result).to.deep.equal({
          kind: "PasswordError",
          errorCode: "REQUIRED",
        });
      });
    });
  });

  describe("behavior", () => {
    const params = {email: "some@email.com", password: "secret", fullName: "John DOE"};
    let session: UserSession;

    context("happy path", () => {
      let row: DataRow;
      let result: TutorCreationSuccess;

      beforeEach(async () => {
        session = {userId: undefined};
        result = (await TutorRegistration(params, session)) as TutorCreationSuccess;
      });

      it("adds the appropriate row to the users table", async () => {
        const {rows} = (await runQuery({sql: "SELECT * FROM users", params: []})) as RowSet;
        row = rows[0];

        if (!row) {
          expect(row, "row in the table").to.exist;
          return;
        }

        expect(row.email, "Row is expected to have the email").to.exist;
        expect(row.password_salt, "Row is expected to have the stored password salt").to.exist;

        const passwordHash = hashString(params.password, row.password_salt as string);
        expect(row.password_hash, "Row is expected to have the hashed password").to.equal(passwordHash);
      });

      it("initializes the session", () => {
        expect(session.userId, "sets the usedIs on the session accordingly").to.equal(result.id);
        expect(session.email, "sets the email on the session accordingly").to.equal(params.email);
      });
    });

    context("when there is already a user like that", () => {
      // Silence this: ER_DUP_ENTRY "Duplicate entry 'some@email.com' for key 'email'"
      stubExport(Logging, "logError", before, after);

      beforeEach(() => TutorRegistration(params, session));

      it("trows with an appropriate error message", async () => {
        const result = await TutorRegistration(params, session);

        expect(result).to.deep.equal({
          kind: "ModelError",
          errorCode: "EMAIL_TAKEN",
        });
      });
    });
  });
});
