import {expect} from "chai";
import {shallow} from "enzyme";
import {AuthenticatedState} from "frontend/pages/profil/src/AuthenticatedState";
import {ProfileForm} from "frontend/pages/profil/src/ProfileForm";
import {ProfilePage} from "frontend/pages/profil/src/ProfilePage";
import {Avatar} from "frontend/shared/src/Components/Avatar";
import {Form} from "frontend/shared/src/Components/Form";
import {NeedsAuthentication} from "frontend/shared/src/Components/NeedsAuthentication";
import {Spinner} from "frontend/shared/src/Components/Spinner";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {PageLayout} from "frontend/shared/src/PageLayout";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {
  expectAlertMessage,
  expectProps,
  find,
  ServerResponse,
  ServerResponseSimulator,
  Stub,
  Wrapper,
} from "frontend/tests/src/TestHelpers";
import * as React from "react";
import {ClientSideProfile, MarkdownDocument} from "shared/src/Model/Profile";
import {pick} from "shared/src/Utils/Language";
import Sinon = require("sinon");

describe("<ProfilePage/>", () => {
  let wrapper: Wrapper<typeof ProfilePage>;

  context("when authenticated", () => {
    beforeEach(() => {
      wrapper = shallow(<ProfilePage isAuthenticated={true} />);
    });

    it("renders the authenticated state", () => {
      const layout = find(wrapper, PageLayout);

      expectProps("layout", layout, {
        title: "Profil",
        isAuthenticated: true,
      });
      expect(wrapper.find(AuthenticatedState).exists()).to.be.true;
    });

    describe("authenticated state", () => {
      let wrapper: Wrapper<typeof AuthenticatedState>;
      let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
      let simulateServerResponse: ServerResponseSimulator;

      beforeEach(() => {
        runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").returns(
          new Promise((resolve) => (simulateServerResponse = resolve))
        );

        wrapper = shallow(<AuthenticatedState />);
      });

      afterEach(() => runScenarioStub.restore());

      it("renders the page layout with a spinner and loads the profile info once", () => {
        expect(wrapper.find(Spinner).exists(), "spinner exists").to.be.true;
        expect(runScenarioStub).to.have.been.calledOnceWithExactly("ProfileLoad", {});
      });

      context("when loading the profile succeeds", () => {
        const response: ClientSideProfile = {
          kind: "ClientSideProfile",
          fullName: "John DOE",
          email: "email@example.com",
          resume: {kind: "MarkdownDocument", value: ""} as MarkdownDocument,
          isPublished: false,
          avatarUrl: null,
        };
        const expectedProps = pick(response, "fullName", "email", "avatarUrl");

        beforeEach(async () => await simulateServerResponse(response));

        it("renders the profile form", () => {
          expectProps("profile form", find(wrapper, ProfileForm), expectedProps);
        });

        describe("profile form", () => {
          let wrapper: Wrapper<typeof ProfileForm>;

          beforeEach(() => {
            wrapper = shallow(<ProfileForm {...expectedProps} />);
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
            expectProps("avatar", wrapper.find(Avatar), {url: response.avatarUrl});
          });

          describe("response handling", () => {
            beforeEach(() => {
              runScenarioStub.restore();
              runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").returns(
                new Promise((resolve) => (simulateServerResponse = resolve))
              );
              wrapper.find(Form).dive().find(SubmitButton).simulate("click");
            });

            afterEach(() => runScenarioStub.restore());

            context("when succeeds", () => {
              beforeEach(async () => simulateServerResponse({kind: "ProfileUpdated"}));

              it("renders a success message", () => {
                expectAlertMessage("success message", wrapper, "success", "Profilul a fost actualizat");
              });
            });

            context("when fails", () => {
              Object.entries({
                "because of an issue with the full name": {
                  serverResponse: {kind: "FullNameError", errorCode: "TOO_LONG"},
                  statusText: "Numele este prea lung",
                },
                "because the session has expired": {
                  serverResponse: {kind: "NotAuthenticatedError"},
                  statusText: "Pentru a vă vedea profilul trebuie să fiți autentificat",
                },
                "because the profile has not been found": {
                  serverResponse: {kind: "ProfileNotFoundError"},
                  statusText: "Nu am găsit profilul",
                },
                "because of a database error": {
                  serverResponse: {kind: "DbError", errorCode: "GENERIC_DB_ERROR"},
                  statusText: "Eroare neprevăzută de bază de date",
                },
                "because of a connection error": {
                  serverResponse: {kind: "TransportError", error: "LieFi is down"},
                  statusText: "LieFi is down",
                },
                "because of an Express.js upgrade": {
                  serverResponse: {kind: "ServerError", error: "Runtime error"},
                  statusText: "Runtime error",
                },
              }).forEach(([caseDescription, {serverResponse, statusText}]) => {
                context(caseDescription, () => {
                  beforeEach(async () => simulateServerResponse(serverResponse as ServerResponse));

                  it("renders an error message", () => {
                    expectAlertMessage("error message", wrapper, "error", statusText);
                  });
                });
              });
            });
          });
        });
      });

      context("when loading the profile fails", () => {
        Object.entries({
          "because not authenticated": {
            serverResponse: {kind: "NotAuthenticatedError"},
            statusText: "Pentru a vă vedea profilul trebuie să vă autentificați",
          },
          "because profile not found": {
            serverResponse: {kind: "ProfileNotFoundError"},
            statusText: "Nu am găsit profilul",
          },
          "because of a DB error": {
            serverResponse: {
              kind: "DbError",
              errorCode: "GENERIC_DB_ERROR",
            },
            statusText: "Eroare neprevăzută de bază de date",
          },
          "because of a transport error": {
            serverResponse: {
              kind: "TransportError",
              error: "Wifi is down or something…",
            },
            statusText: "Eroare: Wifi is down or something…",
          },
          "because of a server error": {
            serverResponse: {
              kind: "ServerError",
              error: "Express.js has a bug",
            },
            statusText: "Eroare: Express.js has a bug",
          },
          "because of something else": {
            serverResponse: {
              kind: "UnexpectedError",
              error: "It just doesn’s work!?",
            },
            statusText: "Eroare: It just doesn’s work!?",
          },
        }).forEach(([caseDescription, {serverResponse, statusText}]) => {
          context(caseDescription, () => {
            beforeEach(async () => simulateServerResponse(serverResponse as ServerResponse));

            it("renders an error message", () => {
              expectAlertMessage("error message", wrapper, "error", statusText);
            });
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
      const layout = find(wrapper, PageLayout);

      expectProps("layout", layout, {
        title: "Profil",
        isAuthenticated: false,
      });
      expect(layout.find(NeedsAuthentication).exists(), "needs-authentication view").to.be.true;
    });
  });
});
