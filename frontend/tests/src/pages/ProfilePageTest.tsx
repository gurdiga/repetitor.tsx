import {expect} from "chai";
import {shallow} from "enzyme";
import {ProfilePage} from "frontend/pages/profil/src/ProfilePage";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {Stub, Wrapper, expectProps, ServerResponseSimulator, find, sleep} from "frontend/tests/src/TestHelpers";
import * as React from "react";
import Sinon = require("sinon");
import {NeedsAuthentication} from "frontend/shared/src/Components/NeedsAuthentication";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {Avatar} from "frontend/shared/src/Components/Avatar";
import {Form} from "frontend/shared/src/Components/Form";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {FullNameValidationRules, FullNameErrorMessages} from "shared/src/Model/Account";
import {DisplayOnlyField} from "frontend/shared/src/Components/FormFields/DisplayOnlyField";
import {ResetPasswordLink} from "frontend/shared/src/Components/ResetPasswordLink";
import {SecondaryButton} from "frontend/shared/src/Components/SecondaryButton";
import {makeLink, Link, MarkdownDocument, ProfileLoaded} from "shared/src/Model/Profile";
import {Spinner} from "frontend/shared/src/Components/Spinner";

describe("<ProfilePage/>", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof ProfilePage>;
  let simulateServerResponse: ServerResponseSimulator;

  context("when authenticated", () => {
    beforeEach(() => {
      runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").returns(
        new Promise((resolve) => (simulateServerResponse = resolve))
      );
    });

    afterEach(() => {
      runScenarioStub.restore();
    });

    describe("rendering", () => {
      beforeEach(() => {
        wrapper = shallow(<ProfilePage isAuthenticated={true} />);
      });

      it("renders the page layout with a spinner and loads the profile info once", () => {
        expectProps("layout", find(wrapper, PageLayout), {
          title: "Profil",
          isAuthenticated: true,
        });
        expect(wrapper.find(Spinner).exists(), "spinner exists").to.be.true;

        const [scenarioName, scenarioInput] = runScenarioStub.args[0];

        expect(runScenarioStub.calledOnce, "once").to.be.true;
        expect(scenarioName).to.equal("ProfileLoad");
        expect(scenarioInput).to.deep.equal({});
      });

      context("when the request succeeds", () => {
        const response: ProfileLoaded = {
          kind: "ProfileLoaded",
          fullName: "John DOE",
          email: "email@example.com",
          photo: makeLink("https://gravatar.com/photo.jpg") as Link,
          resume: {kind: "MarkdownDocument", value: ""} as MarkdownDocument,
          isPublished: false,
        };

        beforeEach(async () => {
          await simulateServerResponse(response);
        });

        it("renderd the filled form and the avatar", () => {
          const form = find(wrapper, Form);

          expect(form.exists(), "form").to.be.true;
          expect(form.props().fields, "fields").to.have.lengthOf(3);
          expect(form.props().actionButtons, "action buttons").to.have.lengthOf(1);

          const [fullNameField, emailField, passwordField] = form.props().fields;

          expectProps("full name", fullNameField, {value: response.fullName, label: "Nume deplin"});
          expectProps("email", emailField, {value: response.email, label: "Adresa de email"});
          expectProps("password", passwordField, {label: "Parola"});
          expectProps("avatar", wrapper.find(Avatar), {url: response.photo});
        });
      });
    });
  });

  context("when not authenticated", () => {
    beforeEach(() => {
      wrapper = shallow(<ProfilePage isAuthenticated={false} />);
    });

    it("renders the page layout with the needs-authentication view", () => {
      const layout = wrapper.find(PageLayout);

      expect(layout.exists(), "layout").to.be.true;
      expect(layout.find(NeedsAuthentication).exists(), "needs-authentication view").to.be.true;
    });
  });
});
