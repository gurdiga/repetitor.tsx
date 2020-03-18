import {expect} from "chai";
import {Stub, truncateTable, truncateTables} from "TestHelpers";
import * as EmailUtils from "Utils/EmailUtils";
import Sinon = require("sinon");
import {TutorPasswordResetStep2} from "ScenarioHandlers/TutorPasswordResetStep2";
import {TutorRegistration} from "ScenarioHandlers/TutorRegistration";
import {TutorPasswordResetStep1} from "ScenarioHandlers/TutorPasswordResetStep1";
import {runQuery, RowSet} from "Utils/Db";
import {getTokenForEmail} from "ScenarioHandlers/Helpers";

describe("TutorPasswordResetStep2", () => {
  let sendEmailStub: Stub<typeof EmailUtils.sendEmail>;

  beforeEach(() => {
    sendEmailStub = Sinon.stub(EmailUtils, "sendEmail");
  });

  afterEach(() => {
    sendEmailStub.restore();
  });

  afterEach(() => truncateTables(["users", "passsword_reset_tokens"]));

  describe("happy path", () => {
    const email = "some@email.com";
    let token: string;

    beforeEach(async () => {
      await TutorRegistration({fullName: "Joe DOE", email, password: "secret"}, {});
      await TutorPasswordResetStep1({email});

      token = await getTokenForEmail(email);
    });

    it("runs", async () => {
      const newPassword = "secret42";
      const result = await TutorPasswordResetStep2({token, newPassword});

      expect(result).to.deep.equal({kind: "TutorPasswordResetSuccess"});
    });
  });
});
