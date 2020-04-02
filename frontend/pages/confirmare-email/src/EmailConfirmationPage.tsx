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
import {
  ResponseState,
  runScenario,
  ServerResponse,
  placeholderServerResponse,
} from "frontend/shared/src/ScenarioRunner";
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
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  if (serverResponse.responseState === ResponseState.NotYetSent) {
    confirmEmailWithToken(token);

    return <AlertMessage type="info">Verificare token…</AlertMessage>;
  } else if (serverResponse.responseState === ResponseState.ReceivedSuccess) {
    return <AlertMessage type="success">{serverResponse.responseText}</AlertMessage>;
  } else if (serverResponse.responseState === ResponseState.ReceivedError) {
    return <AlertMessage type="error">{serverResponse.responseText}</AlertMessage>;
  } else {
    assertNever(serverResponse.responseState);
  }

  async function confirmEmailWithToken(token: string) {
    const response = await runScenario("EmailConfirmation", {token});

    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "EmailConfirmed":
        [responseState, responseText] = [ResponseState.ReceivedSuccess, "Confirmare reușită. Vă mulțumim!"];
        break;
      case "EmailConfirmationTokenValidationError":
        [responseState, responseText] = [
          ResponseState.ReceivedError,
          EmailConfirmationTokenErrorMessages[response.errorCode],
        ];
        break;
      case "EmailConfirmationTokenUnrecognizedError":
        [responseState, responseText] = [ResponseState.ReceivedError, "Token necunoscut"];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "TransportError":
      case "ServerError":
        [responseState, responseText] = [ResponseState.ReceivedError, `Eroare: ${response.error}`];
        break;
      default:
        assertNever(response);
    }

    setServerResponse({
      responseState,
      responseText,
      shouldShow: true,
    });
  }
}

function renderTokenInvalidView(validationErrorCode: EmailConfirmationTokenValidationErrorCode) {
  return <AlertMessage type="error">{EmailConfirmationTokenErrorMessages[validationErrorCode]}</AlertMessage>;
}
