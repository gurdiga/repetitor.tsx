import {expect} from "chai";
import {HTMLAttributes, shallow, ShallowWrapper} from "enzyme";
import {AvatarUploadButton} from "frontend/pages/profil/src/AvatarUploadButton";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {Stub, Wrapper} from "frontend/tests/src/TestHelpers";
import {AvatarUrl} from "shared/src/Model/AvatarUpload";
import Sinon = require("sinon");
import React = require("react");

class FileList {
  constructor(private items: any[]) {}

  get length() {
    return this.items.length;
  }
}

(global as any).FileList = FileList;

describe("AvatarUploadButton", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof AvatarUploadButton>;
  let input: ShallowWrapper<HTMLAttributes, any, React.Component<{}, {}, any>>;

  const onUploaded = Sinon.spy();
  const mockScenarioResult: AvatarUrl = {kind: "AvatarUrl", url: "http://localhost:8084/profil"};

  beforeEach(() => {
    runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves(mockScenarioResult);
    wrapper = shallow(<AvatarUploadButton onUploaded={onUploaded} />);
    input = wrapper.find("input[type='file']");
  });

  afterEach(() => {
    onUploaded.resetHistory();
    runScenarioStub.restore();
  });

  it("does the work", async () => {
    expect(input.exists()).to.be.true;

    const mockFile = {__filename};
    const mockFileList = new FileList([mockFile]);
    const mockChangeEvent = {target: {files: mockFileList}} as any;

    await input.prop("onChange")!(mockChangeEvent);

    expect(runScenarioStub).to.have.been.calledOnceWithExactly("AvatarUpload", {upload: mockFileList});
    expect(onUploaded).to.have.been.calledOnceWithExactly(mockScenarioResult.url);
  });
});
