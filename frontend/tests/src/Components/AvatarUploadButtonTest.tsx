import {expect} from "chai";
import {HTMLAttributes, shallow, ShallowWrapper} from "enzyme";
import {AvatarUploadButton} from "frontend/pages/profil/src/AvatarUploadButton";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {expectAlertMessage, Stub, Wrapper} from "frontend/tests/src/TestHelpers";
import {AvatarUrl, AVATAR_IMAGE_TYPE, MAX_AVATAR_SIZE} from "shared/src/Model/AvatarUpload";
import Sinon = require("sinon");
import React = require("react");

class FileList {
  constructor(public items: any[]) {}

  public item(index: number) {
    return this.items[index];
  }

  public get length(): number {
    return this.items.length;
  }
}

(global as any).FileList = FileList;

describe("AvatarUploadButton", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof AvatarUploadButton>;
  let input: ShallowWrapper<HTMLAttributes, any, React.Component<{}, {}, any>>;

  const mockFile = {type: AVATAR_IMAGE_TYPE};
  const onUploaded = Sinon.spy();

  beforeEach(() => {
    runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario");
    wrapper = shallow(<AvatarUploadButton onUploaded={onUploaded} />);
    input = wrapper.find("input[type='file']");
  });

  afterEach(() => {
    onUploaded.resetHistory();
    runScenarioStub.restore();
  });

  it("does the work", async () => {
    expect(input.exists()).to.be.true;

    const mockFileList = new FileList([mockFile]);
    const mockChangeEvent = {target: {files: mockFileList}} as any;
    const mockScenarioResult: AvatarUrl = {kind: "AvatarUrl", url: "http://localhost:8084/profil"};

    runScenarioStub.resolves(mockScenarioResult);
    await input.prop("onChange")!(mockChangeEvent);

    expect(runScenarioStub).to.have.been.calledOnceWithExactly("AvatarUpload", {upload: mockFileList});
    expect(onUploaded).to.have.been.calledOnceWithExactly(mockScenarioResult.url);
  });

  context("unhappy paths", () => {
    describe("client-side validation", () => {
      Object.entries({
        "when more than one file was selected": {
          mockFileList: new FileList([mockFile, mockFile]),
          errorMessage: "Selectați o singură fotografie",
        },
        "when selected a non-JPEG file": {
          mockFileList: new FileList([{type: "text/plain"}]),
          errorMessage: "Formatul fotografiei nu corespunde: trebuie image/jpeg",
        },
        "when the file is too large": {
          mockFileList: new FileList([{...mockFile, size: MAX_AVATAR_SIZE + 1}]),
          errorMessage: "Poza trebuie să aibă mai puțin de 5MB",
        },
      }).forEach(([description, {mockFileList, errorMessage}]) => {
        context(description, () => {
          it("reports it", async () => {
            const mockChangeEvent = {target: {files: mockFileList}} as any;

            await input.prop("onChange")!(mockChangeEvent);

            expectAlertMessage("validation error", wrapper, "error", errorMessage);
            expect(runScenarioStub).to.not.have.been.called;
            expect(onUploaded).to.not.have.been.called;
          });
        });
      });
    });

    describe("server error conditions", () => {
      Object.entries({
        "when the session has expired": {
          serverResponse: {kind: "NotAuthenticatedError"} as const,
          errorMessage: "Eroare: probabil a expirat sesiunea din cauza inactivității.",
        },
      }).forEach(([description, {serverResponse, errorMessage}]) => {
        context(description, () => {
          beforeEach(() => runScenarioStub.resolves(serverResponse));

          it("reports it", async () => {
            const mockFileList = new FileList([mockFile]);
            const mockChangeEvent = {target: {files: mockFileList}} as any;

            await input.prop("onChange")!(mockChangeEvent);

            expect(runScenarioStub).to.have.been.calledOnceWithExactly("AvatarUpload", {upload: mockFileList});
            expect(onUploaded).to.not.have.been.called;
            expectAlertMessage("validation error", wrapper, "error", errorMessage);
          });
        });
      });
    });
  });
});
