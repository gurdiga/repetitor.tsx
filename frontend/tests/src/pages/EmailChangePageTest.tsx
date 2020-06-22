import {expect} from "chai";
import {shallow} from "enzyme";
import {AuthenticatedState} from "frontend/pages/schimbare-email/src/AuthenticatedState";
import {EmailChangePage} from "frontend/pages/schimbare-email/src/EmailChangePage";
import {Step1} from "frontend/pages/schimbare-email/src/Step1";
import {Step2} from "frontend/pages/schimbare-email/src/Step2";
import {UnauthenticatedState} from "frontend/pages/schimbare-email/src/UnauthenticatedState";
import {Form} from "frontend/shared/src/Components/Form";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {Comp, expectAlertMessage, expectProps, Stub, Wrapper} from "frontend/tests/src/TestHelpers";
import * as React from "react";
import * as Sinon from "sinon";

describe("<EmailChangePage/>", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof EmailChangePage>;

  beforeEach(() => {
    runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "EmailChangeConfirmationRequestSent"});
  });

  afterEach(() => {
    runScenarioStub.restore();
  });

  context("when authenticated", () => {
    const email = "some@email.com";

    it("renders the authenticated UI", () => {
      const params = {};
      const wrapper = shallow(<EmailChangePage isAuthenticated={true} email={email} params={params} />);
      const ui = wrapper.find(AuthenticatedState);

      expectProps<typeof AuthenticatedState>("authenticated state", ui, {
        currentEmail: email,
        params,
      });
    });

    describe("<AuthenticatedState/>", () => {
      context("when token param is not present", () => {
        it("renders the step 1 UI", () => {
          const params = {};
          const wrapper = shallow(<AuthenticatedState currentEmail={email} params={params} />);
          const ui = wrapper.find(Step1);

          expectProps<typeof Step1>("UI", ui, {
            currentEmail: email,
          });
        });

        describe("<Step1/>", () => {
          let wrapper: Wrapper<typeof Step1>;
          let form: Wrapper<typeof Form>;
          const currentEmail = "current@email.com";

          beforeEach(() => {
            wrapper = shallow(<Step1 currentEmail={currentEmail} />);
            form = wrapper.find(Form);
          });

          it("renders a form to input the new email", () => {
            const textField: Comp<typeof TextField> = form.props().fields[0];
            const submitButton: Comp<typeof SubmitButton> = form.props().actionButtons[0];

            expectProps<typeof TextField>("email field", textField, {
              label: "Adresa nouă de email",
              value: "",
              autoFocus: true,
            });

            const expectedValidationRules = ["INCORRECT", "MUST_BE_DIFFERENT", "REQUIRED"];

            expect(textField.props.validationRules).to.have.keys(...expectedValidationRules);
            expect(textField.props.validationMessages).to.have.keys(...expectedValidationRules);

            expectProps<typeof SubmitButton>("submit button", submitButton, {
              label: "Resetează",
            });
          });

          describe("form submission", () => {
            let textField: Comp<typeof TextField>;
            let submitButton: Comp<typeof SubmitButton>;

            const newEmail = "new@email.com";

            beforeEach(() => {
              textField = form.props().fields[0];
              submitButton = form.props().actionButtons[0];
            });

            it("does not submit an invalid email", async () => {
              textField.props.onValueChange({
                value: "new-invalid-email",
                isValid: false,
              });

              await submitButton.props.onClick();

              expect(runScenarioStub.called).to.be.false;
            });

            it("submits a valid email", async () => {
              await submitValidForm();

              expect(runScenarioStub).to.have.been.calledOnceWithExactly("EmailChangeStep1", {newEmail});
              expectAlertMessage(
                "success message",
                wrapper,
                "success",
                "Am trimis cerere de confirmare la adresa new@email.com"
              );
            });

            context("when server responds with an error", () => {
              Object.entries({
                "when email is missing": {
                  errorResponse: {kind: "EmailError", errorCode: "REQUIRED"} as const,
                  uiErrorMessage: "Adresa de email lipsește",
                },
                "when email is the same; this shouldn’t ever happen normally": {
                  errorResponse: {kind: "EmailIsTheSameError"} as const,
                  uiErrorMessage: "Adresa de email nu s-a schimbat",
                },
                "when session expired": {
                  errorResponse: {kind: "NotAuthenticatedError"} as const,
                  uiErrorMessage: "Sesiune expirată. Este nevoie să vă autentificați din nou.",
                },
                "when there was a DB error": {
                  errorResponse: {kind: "DbError", errorCode: "GENERIC_DB_ERROR"} as const,
                  uiErrorMessage: "Eroare neprevăzută de bază de date",
                },
                "when something happened while making the request": {
                  errorResponse: {kind: "TransportError", error: "Fell off 3G"} as const,
                  uiErrorMessage: "Fell off 3G",
                },
                "when the app server chockes": {
                  errorResponse: {kind: "ServerError", error: "500 something"} as const,
                  uiErrorMessage: "500 something",
                },
                "when an unexpected error happened": {
                  errorResponse: {kind: "UnexpectedError", error: "The world turned upside down!"} as const,
                  uiErrorMessage: "The world turned upside down!",
                },
              }).forEach(([description, {errorResponse, uiErrorMessage}]) => {
                context(description, () => {
                  beforeEach(async () => {
                    runScenarioStub.resolves(errorResponse);
                    await submitValidForm();
                  });

                  it("displays the error", () => {
                    expect(runScenarioStub).to.have.been.calledOnceWithExactly("EmailChangeStep1", {newEmail});
                    expectAlertMessage("error message", wrapper, "error", uiErrorMessage);
                  });
                });
              });
            });

            function submitValidForm() {
              const formProps = () => wrapper.find(Form).props();
              const textField: Comp<typeof TextField> = formProps().fields[0];

              textField.props.onValueChange({
                value: newEmail,
                isValid: true,
              });

              const [submitButton] = formProps().actionButtons;

              return submitButton.props.onClick();
            }
          });
        });
      });

      context("when token param present", () => {
        it("renders the step 2 UI", () => {
          const params = {token: "something"};
          const wrapper = shallow(<AuthenticatedState currentEmail={email} params={params} />);
          const ui = wrapper.find(Step2);

          expectProps<typeof Step2>("UI", ui, {
            token: params.token,
          });
        });
      });
    });
  });

  context("when not authenticated", () => {
    it("renders the unauthenticated state", () => {
      wrapper = shallow(<EmailChangePage isAuthenticated={false} params={{}} />);

      expect(wrapper.find(UnauthenticatedState).exists()).to.be.true;
    });
  });
});
