import {expect} from "chai";
import {shallow, ShallowWrapper} from "enzyme";
import * as ScenarioRunner from "frontend/shared/ScenarioRunner";
import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import {describe, it} from "mocha";
import * as React from "react";
import {RegistrationPage, ulaValidationRules} from "RegistrationPage";
import {stub} from "sinon";
import {Stub} from "TestHelpers";
import {UserValidationRules} from "shared/Model/User";
import {Checkbox} from "frontend/shared/Components/FormFields/Checkbox";

describe("<RegistrationPage/>", () => {
  type Wrapper = ShallowWrapper<React.ComponentProps<typeof RegistrationPage>, {}>;

  let wrapper: Wrapper;

  before(() => {
    wrapper = shallow(<RegistrationPage />);
  });

  it("renders the page layout with the appropriate title", () => {
    const layout = wrapper.find(PageLayout);

    expect(layout.prop("title")).to.equal("Înregistrare tutore");
  });

  it("renders a form with the appropriate fields", () => {
    const form = wrapper.find(Form);
    const {fields} = form.props();

    assertProps<typeof TextField>("numele deplin", fields[0], {
      autoFocus: true,
      validationRules: UserValidationRules.fullName,
    });

    assertProps<typeof TextField>("adresa de email", fields[1], {
      inputType: "email",
      validationRules: UserValidationRules.email,
    });

    assertProps<typeof PasswordField>("parola", fields[2], {
      validationRules: UserValidationRules.password,
    });

    assertProps<typeof Checkbox>("condițiile de utilizare", fields[3], {
      value: "off",
      validationRules: ulaValidationRules,
    });
  });

  it("renders the appropriate action buttons", () => {
    const submitButton = getSubmitButton(wrapper);

    assertProps<typeof SubmitButton>("parola", submitButton, {
      label: "Înregistrează",
    });
  });

  context("form submission", () => {
    let postActionStub: Stub<typeof ScenarioRunner.runScenario>;

    beforeEach(() => {
      // TODO: implement the unhappy path test too.
      postActionStub = stub(ScenarioRunner, "runScenario").resolves({kind: "Success"});
    });

    afterEach(() => {
      postActionStub.restore();
    });

    context("when fields are properly filled in", () => {
      beforeEach(async () => {
        const form = wrapper.find(Form);
        const {fields} = form.props();

        const fullNameField: Comp<typeof TextField> = fields[0];
        const emailField: Comp<typeof TextField> = fields[1];
        const passwordField: Comp<typeof PasswordField> = fields[2];
        const userLicenceAgreementCheckbox: Comp<typeof Checkbox> = fields[3];

        fullNameField.props.onValueChange({
          value: "full name",
          isValid: true,
        });

        emailField.props.onValueChange({
          value: "email@example.com",
          isValid: true,
        });

        passwordField.props.onValueChange({
          value: "password",
          isValid: true,
        });

        userLicenceAgreementCheckbox.props.onValueChange({
          value: "on",
          isValid: true,
        });

        await getSubmitButton(wrapper).props.onClick();
      });

      it("submits the field values to the backend", () => {
        expect(ScenarioRunner.runScenario).to.have.been.called;
        expect(wrapper.find(".server-response-received-success"), "success message").to.exist;
      });
    });

    context("when some of the fields aren’t properly filled in", () => {
      beforeEach(async () => {
        const form = wrapper.find(Form);
        const {fields} = form.props();

        const fullNameField: Comp<typeof TextField> = fields[0];
        const emailField: Comp<typeof TextField> = fields[1];
        const passwordField: Comp<typeof PasswordField> = fields[2];
        const userLicenceAgreementCheckbox: Comp<typeof Checkbox> = fields[3];

        fullNameField.props.onValueChange({
          value: "full name",
          isValid: true,
        });

        emailField.props.onValueChange({
          value: "email@example.com",
          isValid: true,
        });

        passwordField.props.onValueChange({
          value: "", // <---- Do not fill in the password
          isValid: false,
        });

        userLicenceAgreementCheckbox.props.onValueChange({
          value: "on",
          isValid: true,
        });

        await getSubmitButton(wrapper).props.onClick();
      });

      it("does not submit the form", () => {
        expect(ScenarioRunner.runScenario).not.to.have.been.called;
      });
    });

    context("when the backend responds with an error", () => {
      beforeEach(async () => {
        const form = wrapper.find(Form);
        const {fields} = form.props();

        const fullNameField: Comp<typeof TextField> = fields[0];
        const emailField: Comp<typeof TextField> = fields[1];
        const passwordField: Comp<typeof PasswordField> = fields[2];

        fullNameField.props.onValueChange({
          value: "full name",
          isValid: true,
        });

        emailField.props.onValueChange({
          value: "email@example.com",
          isValid: true,
        });

        passwordField.props.onValueChange({
          value: "password",
          isValid: true,
        });

        postActionStub.restore();
        postActionStub = stub(ScenarioRunner, "runScenario").resolves({kind: "PasswordError", errorCode: "REQUIRED"});
        await getSubmitButton(wrapper).props.onClick();
      });

      it("submits the form and displays the error message", () => {
        expect(ScenarioRunner.runScenario).to.have.been.called;
        expect(wrapper.find(".server-response-received-error")).to.exist;
      });
    });
  });

  type Comp<C extends React.FunctionComponent<any>> = React.ReactElement<React.ComponentProps<C>>;

  function getSubmitButton(wrapper: Wrapper): React.ReactElement<React.ComponentProps<typeof SubmitButton>> {
    return wrapper.find(Form).props().actionButtons[0];
  }

  function assertProps<C extends React.FunctionComponent<any>>(
    subject: string,
    field: JSX.Element,
    expectedProps: Partial<React.ComponentProps<C>>
  ): void {
    for (const propName in expectedProps) {
      expect(
        field.props[propName],
        `“${subject}” is expected to have prop “${propName}” of “${expectedProps[propName]}”`
      ).to.equal(expectedProps[propName]);
    }
  }
});
