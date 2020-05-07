import {downloadFile, uploadFile} from "backend/src/FileStorage";
import {expect} from "chai";
import * as fs from "fs";

if (process.env.TEST_FILE_STORAGE) {
  describe("FileStorage", () => {
    describe("uploadFile", () => {
      const fileName = ".gitignore";

      beforeEach(async () => {
        await uploadFile(fileName, fileName, "text/plain");
      });

      it("can upload a file", async () => {
        const downloadedFileContent = (await downloadFile(fileName)).body;
        const uploadedFileContent = fs.readFileSync(fileName, {encoding: "utf-8"});

        expect(downloadedFileContent).to.equal(uploadedFileContent);
      });
    });
  });
}
