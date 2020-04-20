import {transporter} from "backend/src/Utils/EmailUtils";

if (process.env.TEST_EMAIL_UTILS) {
  describe("EmailUtils", () => {
    it("can connect", function () {
      this.timeout(5000);
      return transporter.verify();
    });
  });
}
