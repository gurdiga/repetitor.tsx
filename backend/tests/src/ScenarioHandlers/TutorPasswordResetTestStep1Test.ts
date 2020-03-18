import {expect} from "chai";
import {TutorPasswordResetStep1} from "ScenarioHandlers/TutorPasswordResetStep1";
import {TutorRegistration} from "ScenarioHandlers/TutorRegistration";
import {runQuery, RowSet} from "Utils/Db";
import * as EmailUtils from "Utils/EmailUtils";
import Sinon = require("sinon");
import {Stub, truncateTable} from "TestHelpers";
import {getTokenForEmail} from "ScenarioHandlers/Helpers";

describe("TutorPasswordResetStep1", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => {
    sendEmailStub = Sinon.stub(EmailUtils, "sendEmail");
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  afterEach(() => truncateTable("users"));

  it("validates the email", async () => {
    let email = "";
    expect(await TutorPasswordResetStep1({email})).to.deep.equal({kind: "EmailError", errorCode: "REQUIRED"});

    email = "42";
    expect(await TutorPasswordResetStep1({email})).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});

    email = "invalid@email";
    expect(await TutorPasswordResetStep1({email})).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});
  });

  it("tells when the email is not recognized", async () => {
    expect(await TutorPasswordResetStep1({email: "some@email.com"})).to.deep.equal({kind: "UnknownEmailError"});
  });

  it("succeeds when the email is recognized", async () => {
    const email = "some@email.com";

    await TutorRegistration({fullName: "Joe DOE", email, password: "secret"}, {});
    sendEmailStub.resetHistory(); // ignore the registration email

    expect(await TutorPasswordResetStep1({email})).to.deep.equal({kind: "TutorPasswordResetEmailSent"});
    expect(await getTokenForEmail(email), "token created").to.exist;

    const {args} = sendEmailStub.firstCall;

    expect(args[0], "notification email address").to.equal(email);
    expect(args[1], "notification email subject").to.contain("Resetarea parolei");
    expect(args[2], "notification email body").to.contain("/resetare-parola?token=");
  });
});
