import {expect} from "chai";
import {TutorLogin} from "backend/src/ScenarioHandlers/TutorLogin";
import {TutorRegistration} from "backend/src/ScenarioHandlers/TutorRegistration";
import {runQuery} from "backend/src/Utils/Db";
import {stubExport} from "backend/tests/src/TestHelpers";
import * as EmailUtils from "backend/src/Utils/EmailUtils";

describe("TutorLogin", () => {
  const session = {userId: undefined};

  stubExport(EmailUtils, "sendEmail", before, after);

  it("validates the email", async () => {
    const result = await TutorLogin({email: "", password: "secrets"}, session);

    expect(result).to.deep.equal({kind: "EmailError", errorCode: "REQUIRED"});
  });

  it("validates the password", async () => {
    const result = await TutorLogin({email: "some@email.com", password: undefined}, session);

    expect(result).to.deep.equal({kind: "PasswordError", errorCode: "REQUIRED"});
  });

  it("tells when the email is not recognized", async () => {
    const result = await TutorLogin({email: "some@email.com", password: "secret"}, session);

    expect(result).to.deep.equal({kind: "UnknownEmailError"});
  });

  it("tells when the password does not match", async () => {
    const email = "some@email.com";

    await TutorRegistration({fullName: "Joe DOE", email, password: "secret;"}, session);

    const result = await TutorLogin({email, password: "12345"}, session);

    expect(result).to.deep.equal({kind: "IncorrectPasswordError"});
  });

  it("tells when both the email and password match, and sets userId on the session", async () => {
    const session = {userId: undefined};
    const email = "some@email.com";
    const password = "secret";

    await TutorRegistration({fullName: "Joe DOE", email, password}, session);

    const {userId} = session;

    session.userId = undefined;

    const result = await TutorLogin({email, password}, session);

    expect(result).to.deep.equal({kind: "LoginCheckSuccess"});
    expect(session.userId).to.equal(userId);
  });

  afterEach(() => runQuery({sql: "DELETE FROM users", params: []}));
});
