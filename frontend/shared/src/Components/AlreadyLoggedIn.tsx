import * as React from "react";
import {runScenario} from "frontend/shared/src/ScenarioRunner";
import {navigateToPage} from "frontend/shared/src/PageNavigation";
import {assertNever} from "shared/src/Utils/Language";
import {PagePath} from "shared/src/Utils/PagePath";

export function AlreadyLoggedIn(props: React.ComponentProps<any>) {
  const [logoutError, setLogoutError] = React.useState("");

  return (
    <>
      {props.children}
      <button data-test-id="logout-button" onClick={handleLogoutButtonClick}>
        Dezautentificare
      </button>
      {logoutError && <p className="error-message">{logoutError}</p>}
    </>
  );

  async function handleLogoutButtonClick() {
    const response = await runScenario("Logout", {});

    switch (response.kind) {
      case "LogoutSuccess":
        navigateToPage(PagePath.Home);
        break;
      case "TransportError":
        setLogoutError(`„${response.error}” Încercați mai tîrziu.`);
        break;
      case "ServerError":
        setLogoutError(`„${response.error}” Încercați mai tîrziu.`);
        break;
      case "UnexpectedError":
        setLogoutError(`Eroare neprevăzută (${response.error}). Încercați mai tîrziu.`);
        break;
      default:
        assertNever(response);
    }

    return response;
  }
}
