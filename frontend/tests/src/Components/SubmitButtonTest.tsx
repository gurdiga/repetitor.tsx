import {expect} from "chai";
import {shallow} from "enzyme";
import {SubmitButton, SUCCESS_CELEBRATION_DURATION} from "frontend/shared/src/Components/SubmitButton";
import {expectToRenderSnapshot, Wrapper, sleep} from "frontend/tests/src/TestHelpers";
import * as React from "react";
import Sinon = require("sinon");

describe("<SubmitButton/>", () => {
  let onClick: Sinon.SinonStub;
  let wrapper: Wrapper<typeof SubmitButton>;
  const workDuration = 1; // ms

  let time: Sinon.SinonFakeTimers;

  beforeEach(() => {
    onClick = Sinon.stub().returns(doWork(workDuration));
    wrapper = shallow(<SubmitButton label="Submit" onClick={onClick} />);
    time = Sinon.useFakeTimers();
  });

  afterEach(() => {
    time.restore();
  });

  it("renders a <button> with type=submit", () => {
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.prop("type")).to.equal("submit");
    expect(wrapper.text()).to.equal("Submit");
  });

  it("calls onClick and meanwhile disables itself to prevent multiple submissions", async () => {
    expect(wrapper.prop("disabled"), "is initially enabled").to.be.false;

    wrapper.simulate("click");
    expect(onClick.callCount, "calls onClick for the first click").to.equal(1);
    expect(wrapper.prop("disabled"), "is disabled while resolving onClick").to.be.true;

    await wait(workDuration + 1);
    expect(wrapper.prop("disabled"), "is enabled again after onClick resolved").to.be.false;

    time.tick(SUCCESS_CELEBRATION_DURATION); // let the time pass, otherwise Node hangs until timers are done
    expect(wrapper.prop("disabled"), "is enabled again after onClick resolved").to.be.false;
    expect(wrapper.text(), "the status illustration is removed").to.equal("Submit");
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
});
