import {shallow} from "enzyme";
import * as React from "react";
import * as ScenarioRunner from "frontend/shared/src/ScenarioRunner";
import {expect} from "chai";
import Sinon = require("sinon");
import {Stub, Wrapper, expectAlertMessage, Unpromise} from "frontend/tests/src/TestHelpers";
import {EmailConfirmationPage} from "frontend/pages/confirmare-email/src/EmailConfirmationPage";
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {PageLayout} from "frontend/shared/src/PageLayout";

describe("<EmailConfirmationPage/>", () => {
  let runScenarioStub: Stub<typeof ScenarioRunner.runScenario>;
  let wrapper: Wrapper<typeof EmailConfirmationPage>;

  let simulateServerResponse: (value: Unpromise<ReturnType<typeof ScenarioRunner.runScenario>>) => void;

  context("when the token is valid", () => {
    const token = "TOKEN42";

    beforeEach(() => {
      runScenarioStub = Sinon.stub(ScenarioRunner, "runScenario").returns(
        new Promise(resolve => (simulateServerResponse = resolve))
      );
      wrapper = shallow(<EmailConfirmationPage isAuthenticated={false} params={{token}} />);
    });

    afterEach(() => runScenarioStub.restore());

    it("renders an informational message and triggers the email verification", async () => {
      expectAlertMessage("confirmation message", wrapper, "info", "Verificare token…");
      expect(runScenarioStub.called, "called runScenario").to.be.true;
    });

    context("when the server accepts the token", () => {
      beforeEach(async () => {
        simulateServerResponse({
          kind: "EmailConfirmed",
          userId: 42,
          email: "some@email.com",
        });
      });

      it("renders a confirmation message", () => {
        expectAlertMessage("confirmation message", wrapper, "success", "Confirmare reușită. Vă mulțumim!");
      });
    });

    context("when the server does not recognize the token", () => {
      beforeEach(async () => {
        simulateServerResponse({
          kind: "EmailConfirmationTokenUnrecognizedError",
        });
      });

      it("renders the appropriate failure message", () => {
        expectAlertMessage("failure message", wrapper, "error", "Token necunoscut");
      });
    });

    context("when the server does not recognize the token", () => {
      beforeEach(async () => {
        simulateServerResponse({
          kind: "DbError",
          errorCode: "GENERIC_DB_ERROR",
        });
      });

      it("renders the appropriate failure message", () => {
        expectAlertMessage("failure message", wrapper, "error", "Eroare neprevăzută de bază de date");
      });
    });

    context("when can’t connect to server", () => {
      beforeEach(async () => {
        simulateServerResponse({
          kind: "TransportError",
          error: "Network error",
        });
      });

      it("renders the appropriate failure message", () => {
        expectAlertMessage("failure message", wrapper, "error", "Eroare: Network error");
      });
    });
  });

  context("when the token is INVALID", () => {
    const token = "";

    beforeEach(() => {
      wrapper = shallow(<EmailConfirmationPage isAuthenticated={false} params={{token}} />);
    });

    it("renders a page layout and an alert message", () => {
      const layout = wrapper.find(PageLayout);

      expect(layout.exists()).to.be.true;
      expect(layout.prop("title")).to.equal("Confirmare email");

      const alertMessage = wrapper.find(AlertMessage);

      expect(alertMessage.exists(), "alert message is rendered").to.be.true;
      expect(alertMessage.props().type, "alert message type").to.equal("error");
      expect(alertMessage.dive().text(), "alert message text").to.equal("Tokenul de confirmare lipsește");
    });
  });
});
