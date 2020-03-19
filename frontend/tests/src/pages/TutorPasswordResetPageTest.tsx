import {shallow} from "enzyme";
import {Form} from "frontend/shared/Components/Form";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import * as ScenarioRunner from "frontend/shared/ScenarioRunner";
import * as React from "react";
import {TutorPasswordResetPage} from "TutorPasswordResetPage";
import {expect} from "chai";
import Sinon = require("sinon");
import {Stub, Wrapper, expectProps, expectToRenderSnapshot, Comp} from "TestHelpers";
import {PageLayout} from "frontend/shared/PageLayout";
import {UserEmailValidationRules} from "shared/Model/Email";
import {ValidatedValue} from "shared/Utils/Validation";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {UserPasswordValidationRules, passwordErrorMessages} from "shared/Model/Password";

describe("<TutorPasswordResetPage/>", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof TutorPasswordResetPage>;

  describe("step 1", () => {
    beforeEach(() => {
      wrapper = shallow(<TutorPasswordResetPage isAuthenticated={false} params={{}} />);
    });

    context("when form is not yet submitted", () => {
      it("renders a form in the page layout", () => {
        const layout = wrapper.find(PageLayout);
        const form = layout.find(Form);

        expect(layout.exists()).to.be.true;
        expect(layout.prop("title")).not.to.be.empty;
        expect(form.exists()).to.be.true;
      });

      describe("form", () => {
        context("when authenticated", () => {
          const email = "some@email.com";

          beforeEach(() => {
            wrapper = shallow(<TutorPasswordResetPage isAuthenticated={true} email={email} params={{}} />);
          });

          it("renders text field pre-fileld with the email of authenticated user", () => {
            const [emailField] = wrapper.find(Form).props().fields;

            expectProps<typeof TextField>("email field", emailField, {
              autoFocus: true,
              validationRules: UserEmailValidationRules,
              inputType: "email",
              value: email,
            });
          });
        });

        context("when not yet authenticated", () => {
          it("renders an empty text field for the email", () => {
            const [emailField] = wrapper.find(Form).props().fields;

            expectProps<typeof TextField>("email field", emailField, {
              autoFocus: true,
              validationRules: UserEmailValidationRules,
              inputType: "email",
              value: "",
            });
          });
        });

        it("renders the submit button", () => {
          const [submitButton] = wrapper.find(Form).props().actionButtons;

          expectProps<typeof SubmitButton>("submit button", submitButton, {
            label: "Trimite instrucțiuni",
          });
        });

        describe("submission", () => {
          beforeEach(() => {
            runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario");
          });

          afterEach(() => {
            runScenarioStub.restore();
          });

          context("when the email is valid", () => {
            beforeEach(() => {
              runScenarioStub.resolves({kind: "TutorPasswordResetEmailSent"});
              submitEmailValue({
                value: "email@example.com",
                isValid: true,
              });
            });

            it("submits the form", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
            });
          });

          context("when the email is NOT valid", () => {
            submitEmailValue({
              value: "email@example",
              isValid: false,
            });

            it("does NOT submit the form", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.false;
            });
          });

          function submitEmailValue(emailValue: ValidatedValue<string>) {
            const wrapper = shallow(<TutorPasswordResetPage isAuthenticated={false} params={{}} />);
            const formProps = () => wrapper.find(Form).props();
            const emailField: Comp<typeof TextField> = formProps().fields[0];

            emailField.props.onValueChange(emailValue);

            const [submitButton] = formProps().actionButtons;

            return submitButton.props.onClick();
          }
        });
      });

      it("renders the snapshot", () => {
        expectToRenderSnapshot(__filename, wrapper, "initial");
      });
    });

    context("after submitting the form", () => {
      beforeEach(() => {
        wrapper = shallow(<TutorPasswordResetPage isAuthenticated={false} params={{}} />);
      });

      context("happy path", () => {
        beforeEach(async () => {
          runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "TutorPasswordResetEmailSent"});
          await submitValidForm();

          expect(runScenarioStub.called, "called runScenario").to.be.true;
        });

        afterEach(() => {
          runScenarioStub.restore();
        });

        it("renders the success message", () => {
          expect(wrapper.find(".server-response-received-success").exists(), "success message").to.be.true;
        });

        it("renders the snapshot", () => {
          expectToRenderSnapshot(__filename, wrapper, "server-success");
        });
      });

      context("unhappy path", () => {
        beforeEach(async () => {
          runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "UnknownEmailError"});
          await submitValidForm();

          expect(runScenarioStub.called, "called runScenario").to.be.true;
        });

        afterEach(() => {
          runScenarioStub.restore();
        });

        it("renders the error message", () => {
          expect(wrapper.find(".server-response-received-error").exists()).to.be.true;
        });

        it("renders the snapshot", () => {
          expectToRenderSnapshot(__filename, wrapper, "server-error");
        });
      });

      function submitValidForm() {
        const formProps = () => wrapper.find(Form).props();
        const emailField: Comp<typeof TextField> = formProps().fields[0];

        emailField.props.onValueChange({
          value: "email@example.com",
          isValid: true,
        });

        const [submitButton] = formProps().actionButtons;

        return submitButton.props.onClick();
      }
    });
  });

  describe("step 2", () => {
    let form: Wrapper<typeof Form>;

    beforeEach(() => {
      wrapper = shallow(<TutorPasswordResetPage isAuthenticated={false} params={{token: "C0FFEE42"}} />);
      form = wrapper.find(Form);
    });

    context("before submitting the form", () => {
      it("renders a call to action text and a form", () => {
        const p = wrapper.find("p");

        expect(p.debug()).to.contain("Introduceți parola nouă");
        expect(form.exists()).to.be.true;
      });

      describe("form structure", () => {
        it("has a password field for the new password", () => {
          const [passwordField] = form.props().fields;

          expectProps<typeof PasswordField>("password field", passwordField, {
            label: "Parola nouă",
            hasGenerateButton: true,
            autoFocus: true,
            validationRules: UserPasswordValidationRules,
            validationMessages: passwordErrorMessages,
            value: "",
          });
        });

        it("has a submit button", () => {
          const [submitButton] = form.props().actionButtons;

          expectProps<typeof SubmitButton>("submit button", submitButton, {
            label: "Resetează",
          });
        });
      });
    });

    it("renders the snapshot", () => {
      expectToRenderSnapshot(__filename, wrapper, "step2");
    });

    describe("form submission", () => {
      describe("happy path", () => {
        it("runs", () => {
          expect(form).to.exist;
        });
      });
    });
  });
});
