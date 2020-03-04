import {transporter} from "Utils/EmailUtils";

describe("EmailUtils", () => {
  it("can connect", function() {
    this.timeout(5000);
    return transporter.verify();
  });
});
