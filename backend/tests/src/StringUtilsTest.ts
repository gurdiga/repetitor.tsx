import {expect} from "chai";
import {camelCaseToUnderscore} from "shared/src/Utils/StringUtils";

describe("StringUtils", () => {
  describe("camelCaseToUnderscore", () => {
    it("works", () => {
      expect(camelCaseToUnderscore("")).to.equal("");
      expect(camelCaseToUnderscore("camelCaseToUnderscore")).to.equal("camel_case_to_underscore");
      expect(camelCaseToUnderscore("createCDATASection")).to.equal("create_cdatasection");
      expect(camelCaseToUnderscore("EVERYTHING")).to.equal("everything");
      expect(camelCaseToUnderscore("toJSON")).to.equal("to_json");
      expect(camelCaseToUnderscore("to_json")).to.equal("to_json");
      expect(camelCaseToUnderscore("TO_JSON")).to.equal("to_json");
      expect(camelCaseToUnderscore("To_Json")).to.equal("to_json");
    });
  });
});
