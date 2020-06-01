import {expect} from "chai";
import {HTMLAttributes, shallow, ShallowWrapper} from "enzyme";
import {AvatarUploadButton} from "frontend/pages/profil/src/AvatarUploadButton";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {Stub, Wrapper} from "frontend/tests/src/TestHelpers";
import Sinon = require("sinon");
import React = require("react");

class FileList {
  constructor(private items: any[]) {}

  get length() {
    return this.items.length;
  }

  public item(index: number): any | null {
    return this.items[index] || null;
  }
}

(global as any).FileList = FileList;

describe("AvatarUploadButton", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof AvatarUploadButton>;
  let input: ShallowWrapper<HTMLAttributes, any, React.Component<{}, {}, any>>;

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

    const selectedFiles = createMockFileList();
    const mockChangeEvent = {target: {files: selectedFiles}} as any;
    const mockScenarioResult = {kind: "AvatarUrl", url: "THE URL"} as any; // AvatarUrl

    runScenarioStub.resolves(mockScenarioResult);
    await input.prop("onChange")!(mockChangeEvent);

    expect(runScenarioStub).to.have.been.calledOnceWithExactly("AvatarUpload", {upload: selectedFiles});
    expect(onUploaded).to.have.been.calledOnceWithExactly(mockScenarioResult.url);
  });

  function createMockFileList(): FileList {
    return new FileList([{}] as File[]);
  }
});
