import {expect} from "chai";
import {shallow} from "enzyme";
import {ProfilePage} from "frontend/pages/profil/src/ProfilePage";
import {Avatar} from "frontend/shared/src/Components/Avatar";
import {Form} from "frontend/shared/src/Components/Form";
import {NeedsAuthentication} from "frontend/shared/src/Components/NeedsAuthentication";
import {Spinner} from "frontend/shared/src/Components/Spinner";
import {PageLayout} from "frontend/shared/src/PageLayout";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {
  expectAlertMessage,
  expectProps,
  find,
  ServerResponseSimulator,
  Stub,
  Wrapper,
} from "frontend/tests/src/TestHelpers";
import * as React from "react";
import {
  Link,
  makeLink,
  MarkdownDocument,
  NotAuthenticatedError,
  ProfileLoaded,
  ProfileNotFoundError,
} from "shared/src/Model/Profile";
import {DbError, UnexpectedError} from "shared/src/Model/Utils";
import Sinon = require("sinon");

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

      context("when loading the profile succeeds", () => {
        const response: ProfileLoaded = {
          kind: "ProfileLoaded",
          fullName: "John DOE",
          email: "email@example.com",
          photo: makeLink("https://gravatar.com/photo.jpg") as Link,
          resume: {kind: "MarkdownDocument", value: ""} as MarkdownDocument,
          isPublished: false,
        };

        beforeEach(async () => await simulateServerResponse(response));

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

      context("when loading the profile fails", () => {
        context("because not authenticated", () => {
          const response: NotAuthenticatedError = {
            kind: "NotAuthenticatedError",
          };

          beforeEach(async () => await simulateServerResponse(response));

          it("renders a corresponding error message", () => {
            expectAlertMessage(
              "error message",
              wrapper,
              "error",
              "Pentru a vă vedea profilul trebuie să vă autentificați"
            );
          });
        });

        context("because profile not found", () => {
          const response: ProfileNotFoundError = {
            kind: "ProfileNotFoundError",
          };

          beforeEach(async () => await simulateServerResponse(response));

          it("renders a corresponding error message", () => {
            expectAlertMessage("error message", wrapper, "error", "Nu am găsit profilul");
          });
        });

        context("because of a DB error", () => {
          const response: DbError = {
            kind: "DbError",
            errorCode: "GENERIC_DB_ERROR",
          };

          beforeEach(async () => await simulateServerResponse(response));

          it("renders a corresponding error message", () => {
            expectAlertMessage("error message", wrapper, "error", "Eroare neprevăzută de bază de date");
          });
        });

        context("because of a transport error", () => {
          const response: ScenarioRunner.TransportError = {
            kind: "TransportError",
            error: "Wifi is down or something…",
          };

          beforeEach(async () => await simulateServerResponse(response));

          it("renders a corresponding error message", () => {
            expectAlertMessage("error message", wrapper, "error", "Eroare: Wifi is down or something…");
          });
        });

        context("because of a server error", () => {
          const response: ScenarioRunner.ServerError = {
            kind: "ServerError",
            error: "Express.js has a bug",
          };

          beforeEach(async () => await simulateServerResponse(response));

          it("renders a corresponding error message", () => {
            expectAlertMessage("error message", wrapper, "error", "Eroare: Express.js has a bug");
          });
        });

        context("because of something else", () => {
          const response: UnexpectedError = {
            kind: "UnexpectedError",
            error: "It just doesn’s work!?",
          };

          beforeEach(async () => await simulateServerResponse(response));

          it("renders a corresponding error message", () => {
            expectAlertMessage("error message", wrapper, "error", "Eroare: It just doesn’s work!?");
          });
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
