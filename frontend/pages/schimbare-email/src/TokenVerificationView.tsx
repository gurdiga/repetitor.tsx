import React = require("react");
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {ChangeEmailTokenErrorMessages} from "shared/src/Model/EmailChange";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";

interface Props {
  token: string;
}

export function TokenVerificationView(props: Props) {
  const {token} = props;
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  if (serverRequest.requestState === RequestState.NotYetSent || serverRequest.requestState === RequestState.Sent) {
    confirmEmailWithToken(token);

    return <AlertMessage type="info">Verificare token…</AlertMessage>;
  } else if (serverRequest.requestState === RequestState.ReceivedSuccess) {
    return <AlertMessage type="success">{serverRequest.statusText}</AlertMessage>;
  } else if (serverRequest.requestState === RequestState.ReceivedError) {
    return <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>;
  } else {
    assertNever(serverRequest.requestState);
  }

  async function confirmEmailWithToken(token: string) {
    const response = await runScenario("EmailChangeStep2", {token});

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "EmailChangeConfirmed":
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Confirmare reușită. Vă mulțumim!"];
        break;
      case "EmailChangeTokenValidationError":
        [requestState, statusText] = [RequestState.ReceivedError, ChangeEmailTokenErrorMessages[response.errorCode]];
        break;
      case "EmailChangeTokenUnrecognizedError":
        [requestState, statusText] = [RequestState.ReceivedError, "Token necunoscut"];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "TransportError":
      case "ServerError":
      case "UnexpectedError":
        [requestState, statusText] = [RequestState.ReceivedError, `Eroare: ${response.error}`];
        break;
      default:
        assertNever(response);
    }

    setServerRequest({requestState, statusText});
  }
}
