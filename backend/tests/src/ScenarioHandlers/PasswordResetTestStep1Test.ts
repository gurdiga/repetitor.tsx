import {PasswordResetStep1} from "backend/src/ScenarioHandlers/PasswordResetStep1";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as EmailUtils from "backend/src/Utils/EmailUtils";
import {getPasswordResetTokenForEmail} from "backend/tests/src/ScenarioHandlers/Helpers";
import {Stub} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import Sinon = require("sinon");

describe("PasswordResetStep1", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => {
    sendEmailStub = Sinon.stub(EmailUtils, "sendEmail");
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  it("validates the email", async () => {
    let email = "";
    expect(await PasswordResetStep1({email})).to.deep.equal({kind: "EmailError", errorCode: "REQUIRED"});

    email = "42";
    expect(await PasswordResetStep1({email})).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});

    email = "invalid@email";
    expect(await PasswordResetStep1({email})).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});
  });

  it("tells when the email is not recognized", async () => {
    expect(await PasswordResetStep1({email: "some@email.com"})).to.deep.equal({kind: "UnknownEmailError"});
  });

  it("succeeds when the email is recognized", async () => {
    const email = "some@email.com";

    await Registration({fullName: "Joe DOE", email, password: "secret"}, {});
    sendEmailStub.resetHistory(); // ignore the registration email

    expect(await PasswordResetStep1({email})).to.deep.equal({kind: "TutorPasswordResetEmailSent"});
    expect(await getPasswordResetTokenForEmail(email), "token created").to.exist;

    const {args} = sendEmailStub.firstCall;

    expect(args[0], "notification email address").to.equal(email);
    expect(args[1], "notification email subject").to.contain("Resetarea parolei");
    expect(args[2], "notification email body").to.contain("/resetare-parola?token=");
  });
});
