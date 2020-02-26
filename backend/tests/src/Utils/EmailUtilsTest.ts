import {transporter} from "Utils/EmailUtils";

describe("EmailUtils", () => {
  it("can connect", () => {
    return transporter.verify();
  });
});
