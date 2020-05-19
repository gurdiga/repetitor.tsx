import {deleteStoredFile, downloadStoredFile, storeFile} from "backend/src/FileStorage";
import {expect} from "chai";
import * as fs from "fs";

if (process.env.TEST_FILE_STORAGE) {
  describe("FileStorage", () => {
    describe("storeFile", () => {
      const sourceFile = __filename;
      const destinationFileName = `test-file-${Date.now()}.txt`;

      beforeEach(async () => {
        await storeFile(sourceFile, destinationFileName, "text/plain");
      });

      afterEach(async () => {
        await deleteStoredFile(destinationFileName);
      });

      it("can store a file", async () => {
        const storedFileContent = (await downloadStoredFile(destinationFileName)).body;
        const localFileContent = fs.readFileSync(sourceFile, {encoding: "utf-8"});

        expect(storedFileContent).to.equal(localFileContent);
      });
    });

    // TODO:
    // - test unhappy paths for FileStorage.storeFile
    // - test FileStorage.deleteTemFile doesn’t throw
  });
}
