import {expect} from "chai";
import {TutorPasswordRecovery} from "ScenarioHandlers/TutorPasswordRecovery";
import {TutorRegistration} from "ScenarioHandlers/TutorRegistration";
import {runQuery, RowSet} from "Utils/Db";
import * as EmailUtils from "Utils/EmailUtils";
import Sinon = require("sinon");

describe("TutorPasswordRecovery", () => {
  let sendEmailStub: Sinon.SinonStub<Parameters<typeof EmailUtils.sendEmail>, ReturnType<typeof EmailUtils.sendEmail>>;

  beforeEach(() => {
    sendEmailStub = Sinon.stub(EmailUtils, "sendEmail");
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  it("validates the email", async () => {
    let email = "";
    expect(await TutorPasswordRecovery({email})).to.deep.equal({kind: "EmailError", errorCode: "REQUIRED"});

    email = "42";
    expect(await TutorPasswordRecovery({email})).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});

    email = "invalid@email";
    expect(await TutorPasswordRecovery({email})).to.deep.equal({kind: "EmailError", errorCode: "INCORRECT"});
  });

  it("tells when the email is not recognized", async () => {
    expect(await TutorPasswordRecovery({email: "some@email.com"})).to.deep.equal({kind: "UnknownEmailError"});
  });

  it("succeeds when the email is recognized", async () => {
    const email = "some@email.com";

    await TutorRegistration({fullName: "Joe DOE", email, password: "secret"}, {});
    sendEmailStub.resetHistory(); // ignore the registration email

    expect(await TutorPasswordRecovery({email})).to.deep.equal({kind: "TutorPasswordRecoveryEmailSent"});
    expect(await doesTokenExist(email), "token created").to.be.true;
    expect(hasSentTheRecoveryEmail(email), "has sent the email").to.be.true;
  });

  function hasSentTheRecoveryEmail(email: string): boolean {
    return sendEmailStub.calledOnceWith(email, "Recuperarea parolei în Repetitor.md", Sinon.match.string);
  }

  async function doesTokenExist(email: string): Promise<boolean> {
    const {rows} = (await runQuery({
      sql: `
        SELECT token
        FROM passsword_recovery_tokens
        LEFT JOIN users ON passsword_recovery_tokens.userId = users.id
        WHERE users.email = ?
        `,
      params: [email],
    })) as RowSet;

    return rows.length > 0;
  }
});
