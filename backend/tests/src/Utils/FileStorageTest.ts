import * as ErrorLogging from "backend/src/ErrorLogging";
import {deleteStoredFile, deleteTemFile, downloadStoredFile, storeFile} from "backend/src/FileStorage";
import {Stub} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import * as fs from "fs";
import Sinon = require("sinon");

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

      context("when the cloud fails", () => {
        // TODO
      });
    });

    describe("deleteTemFile", () => {
      const filePath = "/some/file";

      let unlinkSyncStub: Stub<typeof fs.unlinkSync>;
      let logErrorStub: Stub<typeof ErrorLogging.logError>;

      beforeEach(() => {
        unlinkSyncStub = Sinon.stub(fs, "unlinkSync");
        logErrorStub = Sinon.stub(ErrorLogging, "logError");
      });

      afterEach(() => {
        unlinkSyncStub.restore();
        logErrorStub.restore();
      });

      context("when fs.unlinkSync works out well", () => {
        it("does the work", () => {
          deleteTemFile(filePath);

          expect(unlinkSyncStub).to.have.been.calledOnceWithExactly(filePath);
        });
      });

      context("when fs.unlinkSync throws", () => {
        const error = new Error("File is missing or something!");

        beforeEach(() => {
          unlinkSyncStub = unlinkSyncStub.throws(error);
        });

        it("reports the error but does not throw", () => {
          expect(() => deleteTemFile(filePath)).not.to.throw();

          expect(unlinkSyncStub).to.have.been.calledOnceWithExactly(filePath);
          expect(logErrorStub, "reports the error").to.have.been.calledOnceWithExactly(error);
        });
      });
    });
  });
}
