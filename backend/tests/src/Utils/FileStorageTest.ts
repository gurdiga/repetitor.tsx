import {downloadStoredFile, storeFile} from "backend/src/FileStorage";
import {expect} from "chai";
import * as fs from "fs";

if (process.env.TEST_FILE_STORAGE) {
  describe("FileStorage", () => {
    describe("storeFile", () => {
      const fileName = ".gitignore";

      beforeEach(async () => {
        await storeFile(fileName, fileName, "text/plain");
      });

      it("can store a file", async () => {
        const storedFileContent = (await downloadStoredFile(fileName)).body;
        const localFileContent = fs.readFileSync(fileName, {encoding: "utf-8"});

        expect(storedFileContent).to.equal(localFileContent);
      });
    });
  });
}
