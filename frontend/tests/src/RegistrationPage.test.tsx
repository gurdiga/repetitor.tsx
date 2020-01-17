import {expect} from "chai";
import {shallow, ShallowWrapper} from "enzyme";
import * as ActionHandling from "frontend/shared/ActionHandling";
import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import {describe, it} from "mocha";
import * as React from "react";
import {RegistrationPage} from "RegistrationPage";
import {ValidationRules} from "shared/Validation";
import {stub} from "sinon";

describe("<RegistrationPage/>", () => {
  let wrapper: ShallowWrapper<React.ComponentProps<typeof RegistrationPage>, {}>;

  before(() => {
    wrapper = shallow(<RegistrationPage />);
  });

  it("renders the page layout with the appropriate title", () => {
    const layout = wrapper.find(PageLayout);

    expect(layout).to.exist;
    expect(layout.prop("title")).to.equal("Înregistrare tutore");
  });

  it("renders a form with the appropriate fields", () => {
    const form = wrapper.find(Form);
    const {fields} = form.props();
    const validationRules = ValidationRules["RegisterUser"];

    assertProps<typeof TextField>("numele deplin", fields[0], {
      label: "Nume deplin",
      autoFocus: true,
      validationRules: validationRules.fullName,
    });

    assertProps<typeof TextField>("adresa de email", fields[1], {
      label: "Adresa de email",
      inputType: "email",
      validationRules: validationRules.email,
    });

    assertProps<typeof PasswordField>("parola", fields[2], {
      label: "Parola",
      validationRules: validationRules.password,
    });
  });

  it("renders the appropriate action buttons", () => {
    const form = wrapper.find(Form);
    const {actionButtons} = form.props();
    const submitButton = actionButtons[0];

    assertProps<typeof SubmitButton>("parola", submitButton, {
      label: "Înregistrează",
    });
  });

  context("behavior", () => {
    const postActionStub = stub(ActionHandling, "postAction");

    afterEach(() => {
      postActionStub.restore();
    });

    it("submits the field values to the backend", () => {
      const form = wrapper.find(Form);
      const submitButton = form.props().actionButtons[0];

      // TODO: submitButton click somehow and then
      // assert ActionHandling.postAction was called with the appropriate args.
    });
  });

  function assertProps<C extends (...props: any[]) => JSX.Element>(
    fieldDescription: string,
    field: JSX.Element,
    props: Partial<React.ComponentProps<C>>
  ): void {
    for (const propName in props) {
      expect(
        field.props[propName],
        `The field “${fieldDescription}” is expected to have prop “${propName}” of “${props[propName]}”`
      ).to.equal(props[propName]);
    }
  }
});
