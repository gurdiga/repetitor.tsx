import * as React from "react";
import {expect} from "chai";
import {shallow} from "enzyme";
import {Checkbox} from "frontend/shared/src/Components/FormFields/Checkbox";
import {PredicateFn} from "shared/src/Utils/Validation";
import {ValidationMessage} from "frontend/shared/src/Components/FormFields/ValidationMessage";
import {Wrapper} from "frontend/tests/src/TestHelpers";

type ValidationErrorCodes = "ONE" | "TWO" | "THREE";

const validationRules: Record<ValidationErrorCodes, PredicateFn> = {
  ONE: () => true,
  TWO: () => true,
  THREE: () => true,
};

const validationMessages: Record<ValidationErrorCodes, string> = {
  ONE: "Uno",
  TWO: "Due",
  THREE: "Tres",
};

describe("<RegistrationPage/>", () => {
  let wrapper: Wrapper<typeof Checkbox>;

  it("does not render error when all the predicates pass", () => {
    wrapper = render(validationRules);
    expect(wrapper.find(ValidationMessage).exists()).to.be.false;
  });

  it("renders the error message corresponding to the first failed predicate", () => {
    wrapper = render({...validationRules, TWO: () => false, THREE: () => false});
    expect(wrapper.find(ValidationMessage).prop("text")).to.equal("Due");
  });

  function render(validationRules: Record<ValidationErrorCodes, PredicateFn>): Wrapper<typeof Checkbox> {
    return shallow(
      <Checkbox
        id="yes"
        validationRules={validationRules}
        validationMessages={validationMessages}
        label="So?"
        value="off"
        onValueChange={() => null}
        showValidationMessage={true}
      />
    );
  }
});
