import {expect} from "chai";
import {shallow} from "enzyme";
import {describe, it} from "mocha";
import React = require("react");
import {RegistrationPage} from "RegistrationPage";

describe("<RegistrationPage/>", () => {
  it("runs", () => {
    let wrapper = shallow(<RegistrationPage />);

    expect(wrapper).to.exist;
  });
});
