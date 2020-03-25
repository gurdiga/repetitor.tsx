import {shallow} from "enzyme";
import {Form} from "frontend/shared/src/Components/Form";
import {PasswordField} from "frontend/shared/src/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import * as React from "react";
import {UserEmailValidationRules} from "shared/src/Model/Email";
import {UserPasswordValidationRules} from "shared/src/Model/Password";
import {expectProps, expectToRenderSnapshot, Stub, Wrapper, Comp} from "frontend/tests/src/TestHelpers";
import {TutorLoginPage} from "frontend/pages/autentificare/src/TutorLoginPage";
import {expect} from "chai";
import Sinon = require("sinon");
import {AlreadyLoggedIn} from "frontend/shared/src/Components/AlreadyLoggedIn";

describe("<TutorLoginPage/>", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof TutorLoginPage>;

  const {location} = global as any;
  const locationStub = Sinon.stub();

  beforeEach(() => {
    (global as any).location = {assign: locationStub};
  });

  afterEach(() => {
    (global as any).location = location;
    locationStub.reset();
  });

  context("when not logged in already", () => {
    describe("form", () => {
      let form: Wrapper<typeof Form>;

      before(() => {
        wrapper = shallow(<TutorLoginPage isAuthenticated={false} />);
        form = wrapper.find(Form);
      });

      it("renders a form with the appropriate fields", () => {
        const {
          fields: [emailField, passwordField],
        } = form.props();

        expectProps<typeof TextField>("email field", emailField, {
          autoFocus: true,
          validationRules: UserEmailValidationRules,
        });

        expectProps<typeof PasswordField>("password field", passwordField, {
          validationRules: UserPasswordValidationRules,
        });
      });

      it("renders the appropriate action buttons", () => {
        const [submitButton] = form.prop("actionButtons");

        expectProps<typeof SubmitButton>("submit button", submitButton, {
          label: "Autentifică",
        });
      });

      describe("form submission", () => {
        context("when fields are properly filled in", () => {
          context("when server responds with success", () => {
            beforeEach(async () => {
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "LoginCheckSuccess"});
              await submitValidForm();
            });

            afterEach(() => {
              runScenarioStub.restore();
            });

            it("submits the field values to the backend and then navigates to home page", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
              expect(wrapper.find(".server-response-received-success").exists(), "success message").to.be.true;
              expect(runScenarioStub.calledBefore(locationStub), "navigates *after* the server response").to.be.true;
              expect(locationStub.calledWith("/"), "navigates to homepage").to.be.true;
            });
          });

          context("when server says the email is incorrect", () => {
            beforeEach(async () => {
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({
                kind: "EmailError",
                errorCode: "INCORRECT",
              });
              await submitValidForm();
            });

            afterEach(() => {
              runScenarioStub.restore();
            });

            it("display the error and does NOT navigate to the home page", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
              expect(wrapper.find(".server-response-received-error").text(), "error message").to.equal(
                "Adresa de email este invalidă"
              );
              expect(locationStub.called, "does not navigate to homepage").to.be.false;
            });
          });

          context("when server says the password is wrong", () => {
            beforeEach(async () => {
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "IncorrectPasswordError"});
              await submitValidForm();
            });

            afterEach(() => {
              runScenarioStub.restore();
            });

            it("display the error and does NOT navigate to the home page", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
              expect(wrapper.find(".server-response-received-error").text(), "error message").to.equal(
                "Parola este incorectă"
              );
              expect(locationStub.called, "does not navigate to homepage").to.be.false;
            });
          });

          context("when server says that the email is unrecognized", () => {
            beforeEach(async () => {
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "UnknownEmailError"});
              await submitValidForm();
            });

            afterEach(() => {
              runScenarioStub.restore();
            });

            it("display the error and does NOT navigate to the home page", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
              expect(wrapper.find(".server-response-received-error").text(), "error message").to.equal(
                "Adresa de email nu este înregistrată în sistem."
              );
              expect(locationStub.called, "does not navigate to homepage").to.be.false;
            });
          });

          context("when server says that something went astray", () => {
            const error = "Something broke!";

            beforeEach(async () => {
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "UnexpectedError", error});
              await submitValidForm();
            });

            afterEach(() => {
              runScenarioStub.restore();
            });

            it("display the error and does NOT navigate to the home page", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
              expect(wrapper.find(".server-response-received-error").text(), "error message").to.equal(error);
              expect(locationStub.called, "does not navigate to homepage").to.be.false;
            });
          });

          context("when can’t connect to the server for some reason", () => {
            const error = "Wifi is down";

            beforeEach(async () => {
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "UnexpectedError", error});
              await submitValidForm();
            });

            afterEach(() => {
              runScenarioStub.restore();
            });

            it("display the error and does NOT navigate to the home page", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
              expect(wrapper.find(".server-response-received-error").text(), "error message").to.equal(error);
              expect(locationStub.called, "does not navigate to homepage").to.be.false;
            });
          });

          context("when the server says that the DB failed", () => {
            beforeEach(async () => {
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({
                kind: "DbError",
                errorCode: "GENERIC_DB_ERROR",
              });
              await submitValidForm();
            });

            afterEach(() => {
              runScenarioStub.restore();
            });

            it("display the error and does NOT navigate to the home page", () => {
              expect(runScenarioStub.called, "called runScenario").to.be.true;
              expect(wrapper.find(".server-response-received-error").text(), "error message").to.equal(
                "Eroare neprevăzută de bază de date"
              );
              expect(locationStub.called, "does not navigate to homepage").to.be.false;
            });
          });
        });
      });

      function submitValidForm() {
        const form = wrapper.find(Form);
        const {fields} = form.props();

        const emailField: Comp<typeof TextField> = fields[0];
        const passwordField: Comp<typeof PasswordField> = fields[1];

        emailField.props.onValueChange({
          value: "email@example.com",
          isValid: true,
        });

        passwordField.props.onValueChange({
          value: "password",
          isValid: true,
        });

        const [submitButton] = wrapper.find(Form).props().actionButtons;

        return submitButton.props.onClick();
      }
    });
  });

  context("when already logged in", () => {
    beforeEach(async () => {
      runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "LogoutSuccess"});
    });

    afterEach(() => {
      runScenarioStub.restore();
    });

    it("renders a button to log out", () => {
      const wrapper = shallow(<TutorLoginPage isAuthenticated={true} />);

      clickLogoutButtonInPage(wrapper);

      expect(runScenarioStub.calledWith("Logout", {})).to.be.true;
    });

    describe("logout result", () => {
      context("when the server says OK", () => {
        it("navigates to homepage", async () => {
          const wrapper = shallow(<TutorLoginPage isAuthenticated={true} />);

          await clickLogoutButtonInPage(wrapper);

          expect(locationStub.calledWith("/"), "navigates to homepage").to.be.true;
        });
      });

      context("when the server breaks", () => {
        beforeEach(async () => {
          runScenarioStub.restore();
          runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "ServerError", error: "Opps!"});
        });

        afterEach(() => {
          runScenarioStub.restore();
        });

        it("displays an appropriate error message", async () => {
          const wrapper = shallow(<TutorLoginPage isAuthenticated={true} />);
          const alreadyLoggedIn = wrapper.find(AlreadyLoggedIn).dive();

          await clickLogoutButtonInAlreadyLoggedIn(alreadyLoggedIn);

          expect(alreadyLoggedIn.find(".error-message").text()).to.equal("„Opps!” Încercați mai tîrziu.");
          expect(locationStub.called, "does NOT navigate to homepage").to.be.false;
        });
      });

      context("when there is an unexpected error", () => {
        beforeEach(async () => {
          runScenarioStub.restore();
          runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({
            kind: "UnexpectedError",
            error: "Crash!",
          });
        });

        afterEach(() => {
          runScenarioStub.restore();
        });

        it("displays an appropriate error message", async () => {
          const wrapper = shallow(<TutorLoginPage isAuthenticated={true} />);
          const alreadyLoggedIn = wrapper.find(AlreadyLoggedIn).dive();

          await clickLogoutButtonInAlreadyLoggedIn(alreadyLoggedIn);

          expect(alreadyLoggedIn.find(".error-message").text()).to.equal(
            "Eroare neprevăzută (Crash!). Încercați mai tîrziu."
          );
          expect(locationStub.called, "does NOT navigate to homepage").to.be.false;
        });
      });

      context("when the wifi is down", () => {
        beforeEach(async () => {
          runScenarioStub.restore();
          runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "TransportError", error: "Help"});
        });

        afterEach(() => {
          runScenarioStub.restore();
        });

        it("displays an appropriate error message", async () => {
          const wrapper = shallow(<TutorLoginPage isAuthenticated={true} />);
          const alreadyLoggedIn = wrapper.find(AlreadyLoggedIn).dive();

          await clickLogoutButtonInAlreadyLoggedIn(alreadyLoggedIn);

          expect(alreadyLoggedIn.find(".error-message").text()).to.equal("„Help” Încercați mai tîrziu.");
          expect(locationStub.called, "does NOT navigate to homepage").to.be.false;
        });
      });
    });

    async function clickLogoutButtonInPage(wrapper: Wrapper<typeof TutorLoginPage>) {
      const alreadyLoggedIn = wrapper.find(AlreadyLoggedIn).dive();

      await clickLogoutButtonInAlreadyLoggedIn(alreadyLoggedIn);
    }

    async function clickLogoutButtonInAlreadyLoggedIn(wrapper: Wrapper<typeof AlreadyLoggedIn>) {
      const mouseEvent = ({} as any) as React.MouseEvent<HTMLButtonElement>;
      const logoutButton = wrapper.find(`button[data-test-id="logout-button"]`);

      await logoutButton.prop("onClick")!(mouseEvent);
    }
  });

  describe("snapshots", () => {
    it("renders the authenticated state", () => {
      const wrapper = shallow(<TutorLoginPage isAuthenticated={true} />);

      expectToRenderSnapshot(__filename, wrapper, "authenticated");
    });

    it("renders the unauthenticated state", () => {
      const wrapper = shallow(<TutorLoginPage isAuthenticated={false} />);

      expectToRenderSnapshot(__filename, wrapper, "unauthenticated");
    });
  });
});
