import React = require("react");
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {Form} from "frontend/shared/src/Components/Form";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {EmailErrorMessages, EmailValidationRules} from "shared/src/Model/Email";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {EmailChangeStep1Input} from "shared/src/Scenarios/EmailChangeStep1";
import {assertNever} from "shared/src/Utils/Language";
import {emptyFieldValue, ValidatedValue} from "shared/src/Utils/Validation";

interface Props {
  currentEmail: string;
}

const EmailIsTheSameErrorMessage = "Adresa de email nu s-a schimbat";

export function Step1(props: Props) {
  const {currentEmail} = props;

  const [newEmail, updateNewEmail] = React.useState(emptyFieldValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [shouldShowServerRequestState, toggleServerRequestState] = React.useState(false);
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <>
      {serverRequest.requestState !== RequestState.ReceivedSuccess && (
        <>
          <p>Introduceți adresa nouă de email.</p>
          <Form
            fields={[
              <TextField
                id="new-password"
                label="Adresa nouă de email"
                value={newEmail.value}
                onValueChange={updateNewEmail}
                validationRules={{
                  ...EmailValidationRules,
                  MUST_BE_DIFFERENT: (text) => !!text && text.trim() !== currentEmail,
                }}
                validationMessages={{
                  ...EmailErrorMessages,
                  MUST_BE_DIFFERENT: EmailIsTheSameErrorMessage,
                }}
                showValidationMessage={shouldShowValidationMessage}
                autoFocus={true}
              />,
            ]}
            actionButtons={[
              <SubmitButton
                label="Resetează"
                onClick={async () => {
                  toggleValidationMessage(true);
                  return await maybeSubmitForm({newEmail});
                }}
              />,
            ]}
          />
        </>
      )}
      {shouldShowServerRequestState && statusMessage(serverRequest.requestState)}
    </>
  );

  function statusMessage(requestState: RequestState) {
    switch (requestState) {
      case RequestState.ReceivedSuccess:
        return <AlertMessage type="success">{serverRequest.statusText}</AlertMessage>;
      case RequestState.ReceivedError:
        return <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>;
      default:
        return undefined;
    }
  }

  async function maybeSubmitForm(fields: Record<keyof EmailChangeStep1Input, ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some((f) => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("EmailChangeStep1", {
      newEmail: fields.newEmail.value,
    });

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "EmailChangeConfirmationRequestSent":
        [requestState, statusText] = [
          RequestState.ReceivedSuccess,
          `Am trimis cerere de confirmare la adresa ${fields.newEmail.value}`,
        ];
        break;
      case "EmailError":
        [requestState, statusText] = [RequestState.ReceivedError, EmailErrorMessages[response.errorCode]];
        break;
      case "EmailIsTheSameError":
        [requestState, statusText] = [RequestState.ReceivedError, EmailIsTheSameErrorMessage];
        break;
      case "NotAuthenticatedError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          "Sesiune expirată. Este nevoie să vă autentificați din nou.",
        ];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "TransportError":
      case "ServerError":
        [requestState, statusText] = [RequestState.ReceivedError, response.error];
        break;
      default:
        assertNever(response);
    }

    setServerRequest({requestState, statusText});
    toggleServerRequestState(true);
  }
}
