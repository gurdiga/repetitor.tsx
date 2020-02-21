import {expect} from "chai";
import {shallow} from "enzyme";
import {Form} from "frontend/shared/Components/Form";
import {Checkbox} from "frontend/shared/Components/FormFields/Checkbox";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import * as ScenarioRunner from "frontend/shared/ScenarioRunner";
import * as PageNavigation from "frontend/shared/PageNavigation";
import {describe, it} from "mocha";
import * as React from "react";
import {TutorRegistrationPage, ulaValidationRules} from "TutorRegistrationPage";
import {UserEmailValidationRules} from "shared/Model/Email";
import {UserPasswordValidationRules} from "shared/Model/Password";
import {TutorFullNameValidationRules} from "shared/Model/Tutor";
import {stub} from "sinon";
import {Comp, expectProps, Stub, Wrapper, expectToRenderSnapshot} from "TestHelpers";

describe("<TutorRegistrationPage/>", () => {
  let wrapper: Wrapper<typeof TutorRegistrationPage>;

  context("when the user is not yet authenticated", () => {
    before(() => {
      wrapper = shallow(<TutorRegistrationPage isAuthenticated={false} />);
    });

    it("renders a form with the appropriate fields", () => {
      const form = wrapper.find(Form);
      const {
        fields: [nameField, emailField, passwordField, ulaCheckbox],
      } = form.props();

      expectProps<typeof TextField>("name field", nameField, {
        autoFocus: true,
        validationRules: TutorFullNameValidationRules,
      });

      expectProps<typeof TextField>("email field", emailField, {
        inputType: "email",
        validationRules: UserEmailValidationRules,
      });

      expectProps<typeof PasswordField>("password field", passwordField, {
        validationRules: UserPasswordValidationRules,
      });

      expectProps<typeof Checkbox>("accepts terms of use checkbox", ulaCheckbox, {
        value: "off",
        validationRules: ulaValidationRules,
      });
    });

    it("renders the appropriate action buttons", () => {
      const submitButton = getSubmitButton(wrapper);

      expectProps<typeof SubmitButton>("submit button", submitButton, {
        label: "Înregistrează",
      });
    });

    it("renders the expected snapshot", () => {
      expectToRenderSnapshot(__filename, wrapper, "default");
    });

    context("form submission", () => {
      let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
      let navigateToPageStub: Stub<typeof PageNavigation.navigateToPage>;

      beforeEach(() => {
        runScenarioStub = stub(ScenarioRunner, "runScenario").resolves({kind: "TutorCreationSuccess", id: 42});
        navigateToPageStub = stub(PageNavigation, "navigateToPage");
      });

      afterEach(() => {
        runScenarioStub.restore();
        navigateToPageStub.restore();
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

        it("navigates to the home page", () => {
          expect(navigateToPageStub.calledWith(PageNavigation.PagePath.Home)).to.be.true;
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
          runScenarioStub = stub(ScenarioRunner, "runScenario").resolves({
            kind: "PasswordError",
            errorCode: "REQUIRED",
          });
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

  describe("snapshots", () => {
    it("renders the authenticated state", () => {
      const wrapper = shallow(<TutorRegistrationPage isAuthenticated={true} />);

      expectToRenderSnapshot(__filename, wrapper, "authenticated");
    });

    it("renders the unauthenticated state", () => {
      const wrapper = shallow(<TutorRegistrationPage isAuthenticated={false} />);

      expectToRenderSnapshot(__filename, wrapper, "unauthenticated");
    });
  });
});
