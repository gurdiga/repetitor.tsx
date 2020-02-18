import {expect} from "chai";
import {TutorLogin} from "ScenarioHandlers/TutorLogin";
import {TutorRegistration} from "ScenarioHandlers/TutorRegistration";
import {runQuery} from "Utils/Db";

describe("TutorLogin", () => {
  const session = {userId: undefined};

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

  afterEach(async () => await runQuery({sql: "DELETE FROM users", params: []}));
});
