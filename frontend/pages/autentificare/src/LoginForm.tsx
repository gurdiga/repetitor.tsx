import React = require("react");
import {AlertMessage, getAlertTypeForRequestState} from "frontend/shared/src/Components/AlertMessage";
import {Form} from "frontend/shared/src/Components/Form";
import {PasswordField} from "frontend/shared/src/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {ResetPasswordLink} from "frontend/shared/src/Components/ResetPasswordLink";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {navigateToPage} from "frontend/shared/src/PageNavigation";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {EmailErrorMessages, EmailValidationRules} from "shared/src/Model/Email";
import {PasswordErrorMessages, PasswordValidationRules} from "shared/src/Model/Password";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {LoginInput} from "shared/src/Scenarios/Login";
import {assertNever} from "shared/src/Utils/Language";
import {PagePath} from "shared/src/Utils/PagePath";
import {emptyFieldValue, ValidatedValue} from "shared/src/Utils/Validation";

export function LoginForm() {
  const [email, updateEmail] = React.useState(emptyFieldValue);
  const [password, updatePassword] = React.useState(emptyFieldValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [shouldShowServerRequestState, toggleServerRequestState] = React.useState(false);
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <>
      <Form
        fields={[
          <TextField
            id="email"
            label="Adresa de email"
            value={email.value}
            inputType="email"
            onValueChange={updateEmail}
            validationRules={EmailValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={EmailErrorMessages}
            autoFocus={true}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password.value}
            onValueChange={updatePassword}
            validationRules={PasswordValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={PasswordErrorMessages}
            additionalControls={<ResetPasswordLink />}
          />,
        ]}
        actionButtons={[
          <SubmitButton
            label="Autentifică"
            onClick={async () => {
              toggleValidationMessage(true);
              return await maybeSubmitForm({email, password});
            }}
          />,
        ]}
      />
      {shouldShowServerRequestState && (
        <AlertMessage type={getAlertTypeForRequestState(serverRequest.requestState)}>
          {serverRequest.statusText}
        </AlertMessage>
      )}
    </>
  );

  async function maybeSubmitForm(fields: Record<keyof LoginInput, ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some((f) => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("Login", {
      email: fields.email.value,
      password: fields.password.value,
    });

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "LoginCheckSuccess":
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Autentificat."];
        break;
      case "EmailError":
        [requestState, statusText] = [RequestState.ReceivedError, EmailErrorMessages[response.errorCode]];
        break;
      case "PasswordError":
        [requestState, statusText] = [RequestState.ReceivedError, PasswordErrorMessages[response.errorCode]];
        break;
      case "UnknownEmailError":
        [requestState, statusText] = [RequestState.ReceivedError, "Adresa de email nu este înregistrată în sistem."];
        break;
      case "IncorrectPasswordError":
        [requestState, statusText] = [RequestState.ReceivedError, "Parola este incorectă"];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
        [requestState, statusText] = [RequestState.ReceivedError, response.error];
        break;
      case "TransportError":
      case "ServerError":
        [requestState, statusText] = [RequestState.ReceivedError, response.error];
        break;
      default:
        assertNever(response);
    }

    if (requestState === RequestState.ReceivedSuccess) {
      navigateToPage(PagePath.Home);
    }

    setServerRequest({requestState, statusText});
    toggleServerRequestState(true);
  }
}
