import * as React from "react";
import {expect} from "chai";
import {shallow, ShallowWrapper} from "enzyme";
import {Checkbox} from "frontend/shared/Components/FormFields/Checkbox";
import {PredicateFn} from "shared/Utils/Validation";
import {ValidationMessage} from "frontend/shared/Components/FormFields/ValidationMessage";

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
  type Wrapper = ShallowWrapper<React.ComponentProps<typeof Checkbox>, {}>;

  let wrapper: Wrapper;

  it("does not render error when all the predicates pass", () => {
    wrapper = render(validationRules);
    expect(wrapper.find(ValidationMessage).exists()).to.be.false;
  });

  it("renders the error message corresponding to the first failed predicate", () => {
    wrapper = render({...validationRules, TWO: () => false, THREE: () => false});
    expect(wrapper.find(ValidationMessage).prop("text")).to.equal("Due");
  });

  function render(validationRules: Record<ValidationErrorCodes, PredicateFn>): Wrapper {
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
