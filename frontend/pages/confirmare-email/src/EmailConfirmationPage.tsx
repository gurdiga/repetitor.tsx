import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import * as React from "react";
import {
  EmailConfirmationTokenErrorMessages,
  EmailConfirmationTokenValidationErrorCode,
  EmailConfirmationTokenValidationRules,
} from "shared/src/Model/EmailConfirmation";
import {PageProps} from "shared/src/Utils/PageProps";
import {validateWithRules} from "shared/src/Utils/Validation";
import {RequestState, runScenario, ServerRequest, placeholderServerResponse} from "frontend/shared/src/ScenarioRunner";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";

interface Props extends PageProps {
  params: QueryStringParams;
}

export function EmailConfirmationPage(props: Props) {
  const {isAuthenticated, params} = props;
  const {token} = params;
  const tokenValidationResult = validateWithRules(token, EmailConfirmationTokenValidationRules);

  return (
    <PageLayout {...{title: "Confirmare email", isAuthenticated}}>
      {tokenValidationResult.kind === "Valid"
        ? renderTokenVerificationView(token)
        : renderTokenInvalidView(tokenValidationResult.validationErrorCode)}
    </PageLayout>
  );
}

function renderTokenVerificationView(token: string) {
  const [serverResponse, setServerResponse] = React.useState<ServerRequest>(placeholderServerResponse);

  if (serverResponse.requestState === RequestState.NotYetSent || serverResponse.requestState === RequestState.Sent) {
    confirmEmailWithToken(token);

    return <AlertMessage type="info">Verificare token…</AlertMessage>;
  } else if (serverResponse.requestState === RequestState.ReceivedSuccess) {
    return <AlertMessage type="success">{serverResponse.statusText}</AlertMessage>;
  } else if (serverResponse.requestState === RequestState.ReceivedError) {
    return <AlertMessage type="error">{serverResponse.statusText}</AlertMessage>;
  } else {
    assertNever(serverResponse.requestState);
  }

  async function confirmEmailWithToken(token: string) {
    const response = await runScenario("EmailConfirmation", {token});

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "EmailConfirmed":
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Confirmare reușită. Vă mulțumim!"];
        break;
      case "EmailConfirmationTokenValidationError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          EmailConfirmationTokenErrorMessages[response.errorCode],
        ];
        break;
      case "EmailConfirmationTokenUnrecognizedError":
        [requestState, statusText] = [RequestState.ReceivedError, "Token necunoscut"];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "TransportError":
      case "ServerError":
        [requestState, statusText] = [RequestState.ReceivedError, `Eroare: ${response.error}`];
        break;
      default:
        assertNever(response);
    }

    setServerResponse({
      requestState: requestState,
      statusText: statusText,
      shouldShow: true,
    });
  }
}

function renderTokenInvalidView(validationErrorCode: EmailConfirmationTokenValidationErrorCode) {
  return <AlertMessage type="error">{EmailConfirmationTokenErrorMessages[validationErrorCode]}</AlertMessage>;
}
