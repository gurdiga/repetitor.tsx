import * as EmailUtils from "backend/src/EmailUtils";
import * as FileStorage from "backend/src/FileStorage";
import {loadProfile} from "backend/src/Persistence/AccountPersistence";
import {AvatarUpload} from "backend/src/ScenarioHandlers/AvatarUpload";
import {Login} from "backend/src/ScenarioHandlers/Login";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import * as StringUtils from "backend/src/StringUtils";
import {Stub, stubExport, unregisterUser} from "backend/tests/src/TestHelpers";
import {expect} from "chai";
import {UploadedFile} from "shared/src/Model/FileUpload";
import {ProfileLoaded} from "shared/src/Model/Profile";
import {UserSession} from "shared/src/Model/UserSession";
import * as Sinon from "sinon";

describe("AvatarUpload", () => {
  let storeFileStub: Stub<typeof FileStorage.storeFile>;
  let deleteStoredFileStub: Stub<typeof FileStorage.deleteStoredFile>;
  let deleteTemFileStub: Stub<typeof FileStorage.deleteTemFile>;
  let getRandomStringStub: Stub<typeof StringUtils.getRandomString>;

  const email = "AvatarUpload@email.com";
  const password = "53cr37";
  const session: UserSession = {};
  const randomString = "16-character-rnd";

  stubExport(EmailUtils, "sendEmail", before, after); // Skip registration emails

  before(async () => {
    await Registration({fullName: "Joe DOE", email, password}, session);
    await Login({email, password}, session);
  });

  after(async () => {
    await unregisterUser(email);
  });

  beforeEach(() => {
    storeFileStub = Sinon.stub(FileStorage, "storeFile");
    deleteStoredFileStub = Sinon.stub(FileStorage, "deleteStoredFile");
    deleteTemFileStub = Sinon.stub(FileStorage, "deleteTemFile");
    getRandomStringStub = Sinon.stub(StringUtils, "getRandomString").returns(randomString);
  });

  afterEach(() => {
    storeFileStub.restore();
    deleteStoredFileStub.restore();
    deleteTemFileStub.restore();
    getRandomStringStub.restore();
  });

  describe("happy path", () => {
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

      const expectedCloudFileName = `avatar-${session.userId}-${randomString}.jpg`;

      expect(storeFileStub, "stores the file").to.have.been.calledOnceWithExactly(
        uploadedFile.path,
        expectedCloudFileName,
        uploadedFile.mimetype
      );

      expect(deleteTemFileStub, "deletes the temp file").to.have.been.calledOnceWithExactly(uploadedFile.path);

      const newProfile = (await loadProfile(session.userId!)) as ProfileLoaded;

      expect(newProfile.avatarFilename).to.equal(expectedCloudFileName);
    });

    context("when old avatar", () => {
      const oldAvatar: UploadedFile = {
        originalname: "IMG042042.JPG",
        path: "/some/path",
        mimetype: "image/jpeg",
        size: 1,
      };

      const newAvatar: UploadedFile = {
        originalname: "IMG042043.JPG",
        path: "/some/path2",
        mimetype: "image/jpeg",
        size: 2,
      };

      const randomStringForNewAvatar = "rnd-string-for-new-avatar";

      beforeEach(async () => {
        await AvatarUpload({upload: [oldAvatar]}, session);
        storeFileStub.resetHistory();
        getRandomStringStub.returns(randomStringForNewAvatar);
      });

      it("deletes the old one and registers the new one", async () => {
        await AvatarUpload({upload: [newAvatar]}, session);

        const oldAvatarCloudFileName = `avatar-${session.userId}-${randomString}.jpg`;

        expect(deleteStoredFileStub, "deletes the old avatar from the cloud").to.have.been.calledOnceWithExactly(
          oldAvatarCloudFileName
        );

        const newAvatarCloudFileName = `avatar-${session.userId}-${randomStringForNewAvatar}.jpg`;

        expect(storeFileStub, "stores the new avatar").to.have.been.calledOnceWithExactly(
          newAvatar.path,
          newAvatarCloudFileName,
          newAvatar.mimetype
        );

        const newProfile = (await loadProfile(session.userId!)) as ProfileLoaded;

        expect(newProfile.avatarFilename).to.equal(newAvatarCloudFileName);
      });
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
