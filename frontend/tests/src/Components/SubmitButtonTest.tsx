import {expect} from "chai";
import {shallow} from "enzyme";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {expectToRenderSnapshot, Wrapper} from "frontend/tests/src/TestHelpers";
import * as React from "react";
import Sinon = require("sinon");

describe("<SubmitButton/>", () => {
  let onClick: Sinon.SinonStub;
  let wrapper: Wrapper<typeof SubmitButton>;
  const workDuration = 1; // ms

  beforeEach(() => {
    onClick = Sinon.stub().returns(doWork(workDuration));
    wrapper = shallow(<SubmitButton label="Submit" onClick={onClick} />);
  });

  it("renders a <button> with type=submit", () => {
    const button = wrapper.find("button");

    expect(button.exists()).to.be.true;
    expect(button.prop("type")).to.equal("submit");
    expect(button.text()).to.equal("Submit");
  });

  it("calls onClick and meanwhile disables itself to prevent multiple submissions", async () => {
    const button = wrapper.find("button");

    expect(button.prop("disabled"), "is initially enabled").to.be.false;

    button.simulate("click");
    expect(onClick.callCount, "calls onClick for the first click").to.equal(1);
    expect(wrapper.find("button").prop("disabled"), "is disabled while resolving onClick").to.be.true;

    await wait(workDuration + 1);
    expect(wrapper.find("button").prop("disabled"), "is enabled again after onClick resolved").to.be.false;
  });

  it("renders snapshot", () => {
    expectToRenderSnapshot(__filename, wrapper, "default");
  });

  async function doWork(ms: number): Promise<void> {
    sleep(ms);
  }

  async function wait(ms: number): Promise<void> {
    sleep(ms);
  }

  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});
