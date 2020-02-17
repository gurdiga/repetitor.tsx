import {expect} from "chai";
import {shallow} from "enzyme";
import {Form} from "frontend/shared/Components/Form";
import {Checkbox} from "frontend/shared/Components/FormFields/Checkbox";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import * as ScenarioRunner from "frontend/shared/ScenarioRunner";
import {describe, it} from "mocha";
import * as React from "react";
import {TutorRegistrationPage, ulaValidationRules} from "TutorRegistrationPage";
import {UserEmailValidationRules} from "shared/Model/Email";
import {UserPasswordValidationRules} from "shared/Model/Password";
import {TutorFullNameValidationRules} from "shared/Model/Tutor";
import {stub} from "sinon";
import {Comp, expectProps, Stub, Wrapper} from "TestHelpers";

describe("<TutorRegistrationPage/>", () => {
  let wrapper: Wrapper<typeof TutorRegistrationPage>;

  before(() => {
    wrapper = shallow(<TutorRegistrationPage />);
  });

  it("renders the page layout with the appropriate title", () => {
    const layout = wrapper.find(PageLayout);

    expect(layout.prop("title")).to.equal("Înregistrare repetitor");
  });

  it("renders a form with the appropriate fields", () => {
    const form = wrapper.find(Form);
    const {fields} = form.props();

    expectProps<typeof TextField>("numele deplin", fields[0], {
      autoFocus: true,
      validationRules: TutorFullNameValidationRules,
    });

    expectProps<typeof TextField>("adresa de email", fields[1], {
      inputType: "email",
      validationRules: UserEmailValidationRules,
    });

    expectProps<typeof PasswordField>("parola", fields[2], {
      validationRules: UserPasswordValidationRules,
    });

    expectProps<typeof Checkbox>("condițiile de utilizare", fields[3], {
      value: "off",
      validationRules: ulaValidationRules,
    });
  });

  it("renders the appropriate action buttons", () => {
    const submitButton = getSubmitButton(wrapper);

    expectProps<typeof SubmitButton>("parola", submitButton, {
      label: "Înregistrează",
    });
  });

  context("form submission", () => {
    let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;

    beforeEach(() => {
      runScenarioStub = stub(ScenarioRunner, "runScenario").resolves({kind: "TutorCreationSuccess", id: 42});
    });

    afterEach(() => {
      runScenarioStub.restore();
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
        expect(runScenarioStub.called).to.be.true;
        expect(wrapper.find(".server-response-received-success").exists(), "success message").to.be.true;
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
          value: "secret",
          isValid: true,
        });

        userLicenceAgreementCheckbox.props.onValueChange({
          value: "off", // <---- Not checking the User Agreement
          isValid: false,
        });

        await getSubmitButton(wrapper).props.onClick();
      });

      it("does not submit the form", () => {
        expect(runScenarioStub.called).to.be.false;
      });
    });

    context("when the backend responds with an error", () => {
      beforeEach(async () => {
        const form = wrapper.find(Form);
        const {fields} = form.props();

        const fullNameField: Comp<typeof TextField> = fields[0];
        const emailField: Comp<typeof TextField> = fields[1];
        const passwordField: Comp<typeof PasswordField> = fields[2];
        const ulaCheckbox: Comp<typeof Checkbox> = fields[3];

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

        ulaCheckbox.props.onValueChange({
          value: "on",
          isValid: true,
        });

        runScenarioStub.restore();
        runScenarioStub = stub(ScenarioRunner, "runScenario").resolves({kind: "PasswordError", errorCode: "REQUIRED"});
        await getSubmitButton(wrapper).props.onClick();
      });

      it("submits the form and displays the error message", () => {
        expect(runScenarioStub.called).to.be.true;
        expect(wrapper.find(".server-response-received-error").exists()).to.be.true;
      });
    });
  });

  function getSubmitButton(
    wrapper: Wrapper<typeof TutorRegistrationPage>
  ): React.ReactElement<React.ComponentProps<typeof SubmitButton>> {
    return wrapper.find(Form).props().actionButtons[0];
  }
});
