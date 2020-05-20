import * as ErrorLogging from "backend/src/ErrorLogging";
import {deleteStoredFile, deleteTemFile, getStoredFileUrl, storeFile} from "backend/src/FileStorage";
import {Stub} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import * as fs from "fs";
import {IncomingHttpHeaders} from "http2";
import * as https from "https";
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

      describe("unhappy paths", () => {
        const {instanceOf, has} = Sinon.match;

        let logErrorStub: Stub<typeof ErrorLogging.logError>;
        beforeEach(() => (logErrorStub = Sinon.stub(ErrorLogging, "logError")));
        afterEach(() => logErrorStub.restore());

        context("when the source file is missing", () => {
          const badSourceFile = `${sourceFile};-)`;

          it("reports and logs the error", async () => {
            const result = await storeFile(badSourceFile, destinationFileName, "text/plain");

            expect(result).to.deep.equal({kind: "UploadTempFileMissingErrorr"});
            expect(logErrorStub).to.have.been.calledOnceWithExactly(
              instanceOf(Error).and(has("message", `UploadTempFileMissingErrorr: ${badSourceFile}`))
            );
          });
        });

        context("when the cloud fails for any reason", () => {
          // Giving it bad input intentionally, to make it fail.
          const destinationFileName = ".";
          const contentType = "}}}";

          it("reports and logs the error", async () => {
            const result = await storeFile(sourceFile, destinationFileName, contentType);

            expect(result).to.deep.equal({kind: "CloudUploadError"});
            expect(logErrorStub).to.have.been.calledOnceWithExactly(
              instanceOf(Error).and(has("message", `The object name '${destinationFileName}' is invalid.`))
            );
          });
        });
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

interface DownloadedFile {
  body: string;
  headers: IncomingHttpHeaders;
}

export async function downloadStoredFile(filename: string): Promise<DownloadedFile> {
  return new Promise((resolve, reject) => {
    https
      .get(getStoredFileUrl(filename), (res) => {
        res.setEncoding("utf8");

        let body = "";

        res.on("data", (data) => (body += data));
        res.on("end", () => resolve({body, headers: res.headers}));
      })
      .on("error", reject);
  });
}
