import {shallow} from "enzyme";
import {Form} from "frontend/shared/Components/Form";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import * as ScenarioRunner from "frontend/shared/ScenarioRunner";
import * as React from "react";
import {TutorPasswordRecoveryPage} from "TutorPasswordRecoveryPage";
import {expect} from "chai";
import Sinon = require("sinon");
import {Stub, Wrapper} from "TestHelpers";

describe("<TutorPasswordRecoveryPage/>", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof TutorPasswordRecoveryPage>;

  it("runs", () => {
    expect(TutorPasswordRecoveryPage).to.exist;
  });
});
