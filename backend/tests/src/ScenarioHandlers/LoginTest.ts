import {expect} from "chai";
import {Login} from "backend/src/ScenarioHandlers/Login";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import {stubExport} from "backend/tests/src/TestHelpers";
import * as EmailUtils from "backend/src/EmailUtils";
import {UserSession} from "shared/src/Model/UserSession";

describe("Login", () => {
  const session: UserSession = {userId: undefined};

  stubExport(EmailUtils, "sendEmail", before, after);

  it("validates the email", async () => {
    const result = await Login({email: "", password: "secrets"}, session);

    expect(result).to.deep.equal({kind: "EmailError", errorCode: "REQUIRED"});
  });

  it("validates the password", async () => {
    const result = await Login({email: "some@email.com", password: undefined}, session);

    expect(result).to.deep.equal({kind: "PasswordError", errorCode: "REQUIRED"});
  });

  it("tells when the email is not recognized", async () => {
    const result = await Login({email: "some@email.com", password: "secret"}, session);

    expect(result).to.deep.equal({kind: "UnknownEmailError"});
  });

  it("tells when the password does not match", async () => {
    const email = "some@email.com";

    await Registration({fullName: "Joe DOE", email, password: "secret;"}, session);

    const result = await Login({email, password: "12345"}, session);

    expect(result).to.deep.equal({kind: "IncorrectPasswordError"});
  });

  it("tells when both the email and password match, and sets userId on the session", async () => {
    const session: UserSession = {userId: undefined};
    const email = "some@email.com";
    const password = "secret";

    await Registration({fullName: "Joe DOE", email, password}, session);

    const {userId} = session;

    session.userId = undefined;

    const result = await Login({email, password}, session);

    expect(result).to.deep.equal({kind: "LoginCheckSuccess"});
    expect(session.userId).to.equal(userId);
    expect(session.email).to.equal(email);
  });
});
