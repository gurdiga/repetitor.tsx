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
import {expectProps, Stub, Wrapper} from "frontend/tests/src/TestHelpers";
import * as React from "react";
import * as Sinon from "sinon";

describe("<EmailChangePage/>", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof EmailChangePage>;

  beforeEach(() => {
    runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").resolves({kind: "LoginCheckSuccess"});
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
            const [textField] = form.props().fields;
            const [submitButton] = form.props().actionButtons;

            expectProps<typeof TextField>("email field", textField, {
              label: "Adresa nouă de email",
              value: "",
              autoFocus: true,
            });

            expectProps<typeof SubmitButton>("submit button", submitButton, {
              label: "Resetează",
            });
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
