import * as FileStorage from "backend/src/FileStorage";
import {AvatarUpload} from "backend/src/ScenarioHandlers/AvatarUpload";
import {Stub} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import {UploadedFile} from "shared/src/Model/FileUpload";
import Sinon = require("sinon");

describe("AvatarUpload", () => {
  let storeFileStub: Stub<typeof FileStorage.storeFile>;
  let deleteTemFileStub: Stub<typeof FileStorage.deleteTemFile>;

  beforeEach(() => {
    storeFileStub = Sinon.stub(FileStorage, "storeFile");
    deleteTemFileStub = Sinon.stub(FileStorage, "deleteTemFile");
  });

  afterEach(() => {
    storeFileStub.restore();
    deleteTemFileStub.restore();
  });

  describe("happy path", () => {
    const session = {userId: 42};
    const uploadedFile: UploadedFile = {
      originalname: "IMG042042.JPG",
      path: "/some/path",
      mimetype: "image/jpeg",
      size: 1,
    };
    const input = {upload: [uploadedFile]};

    let time: Sinon.SinonFakeTimers;
    beforeEach(() => (time = Sinon.useFakeTimers(Date.parse("2020-05-18T07:47:47.000Z"))));
    afterEach(() => time.restore());

    const fileStorageUrl = "http://cloud.net/bucket/avatar.jpg";

    beforeEach(() => {
      storeFileStub.resolves({
        kind: "StoreFileSuccess",
        url: fileStorageUrl,
      });
    });

    it("does the work", async () => {
      expect(await AvatarUpload(input, session), "reports the succes").to.deep.equal({
        kind: "AvatarUrl",
        url: fileStorageUrl,
      });

      expect(storeFileStub, "stores the file").to.have.been.calledOnceWithExactly(
        uploadedFile.path,
        "avatar-42-1589788067000.jpg",
        uploadedFile.mimetype
      );

      expect(deleteTemFileStub, "deletes the temp file").to.have.been.calledOnceWithExactly(uploadedFile.path);
    });

    context("when storeFile fails", () => {
      Object.entries({
        "when source temp file is missing": {
          storeFileResponse: {kind: "UploadTempFileMissingErrorr" as const},
          expectedResult: {kind: "UploadTempFileMissingErrorr"},
        },
        "when cloud storage fails": {
          storeFileResponse: {kind: "CloudUploadError" as const},
          expectedResult: {kind: "CloudUploadError"},
        },
      }).forEach(([description, {storeFileResponse, expectedResult}]) => {
        context(description, () => {
          beforeEach(() => storeFileStub.resolves(storeFileResponse));

          it("reports the failure", async () => {
            expect(await AvatarUpload(input, session)).to.deep.equal(expectedResult);
          });
        });
      });
    });
  });

  describe("unhappy paths", () => {
    Object.entries({
      "when not authenticated": {
        input: {upload: []},
        session: {userId: undefined},
        expectedResult: {kind: "NotAuthenticatedError"},
      },
      "when upload parsing reports FileTooLargeError": {
        input: {upload: {kind: "FileTooLargeError" as const}},
        session: {userId: 42},
        expectedResult: {kind: "FileTooLargeError"},
      },
      "when upload parsing reports UnacceptableUploadError": {
        input: {upload: {kind: "UnacceptableUploadError" as const, error: "For some reason"}},
        session: {userId: 42},
        expectedResult: {kind: "UnacceptableUploadError", error: "For some reason"},
      },
      "when upload is missing": {
        input: {upload: []},
        session: {userId: 42},
        expectedResult: {kind: "UploadMissingError"},
      },
      "when uploaded file is not a JPEG image": {
        input: {upload: [{mimetype: "text/plain", originalname: "", path: "", size: 0}]},
        session: {userId: 42},
        expectedResult: {kind: "BadFileTypeError"},
      },
    }).forEach(([description, {input, session, expectedResult}]) => {
      context(description, () => {
        it("reports the failure", async () => {
          expect(await AvatarUpload(input, session)).to.deep.equal(expectedResult);
        });
      });
    });
  });
});
