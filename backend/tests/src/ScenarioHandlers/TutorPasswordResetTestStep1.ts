import {expect} from "chai";
import {TutorPasswordResetStep1} from "ScenarioHandlers/TutorPasswordResetStep1";
import {TutorRegistration} from "ScenarioHandlers/TutorRegistration";
import {runQuery, RowSet} from "Utils/Db";
import * as EmailUtils from "Utils/EmailUtils";
import Sinon = require("sinon");
import {Stub} from "TestHelpers";

describe("TutorPasswordResetStep1", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => {
    sendEmailStub = Sinon.stub(EmailUtils, "sendEmail");
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  afterEach(() => runQuery({sql: "DELETE FROM users", params: []}));

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
    expect(await doesTokenExist(email), "token created").to.be.true;
    expect(hasSentTheResetEmail(email), "has sent the email").to.be.true;
  });

  function hasSentTheResetEmail(email: string): boolean {
    return sendEmailStub.calledOnceWith(email, "Resetarea parolei în Repetitor.md", Sinon.match.string);
  }

  async function doesTokenExist(email: string): Promise<boolean> {
    const {rows} = (await runQuery({
      sql: `
        SELECT token
        FROM passsword_reset_tokens
        LEFT JOIN users ON passsword_reset_tokens.userId = users.id
        WHERE users.email = ?
        `,
      params: [email],
    })) as RowSet;

    return rows.length > 0;
  }
});
