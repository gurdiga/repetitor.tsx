import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {Form} from "frontend/shared/Components/Form";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {initialFieldValue, ValidatedValue} from "shared/Utils/Validation";
import {ServerResponse, runScenario, ResponseState, placeholderServerResponse} from "frontend/shared/ScenarioRunner";
import {assertNever} from "shared/Utils/Language";
import {dbErrorMessages} from "shared/Model/Utils";
import {TutorLoginDTO} from "shared/Scenarios/TutorLogin";
import {UserEmailValidationRules, emailErrorMessages} from "shared/Model/Email";
import {UserPasswordValidationRules, passwordErrorMessages} from "shared/Model/Password";

export function TutorLoginPage() {
  const [email, updateEmail] = React.useState(initialFieldValue);
  const [password, updatePassword] = React.useState(initialFieldValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  return (
    <PageLayout title="Autentificare repetitor">
      <Form
        fields={[
          <TextField
            id="email"
            label="Adresa de email"
            value={email.value}
            inputType="email"
            onValueChange={updateEmail}
            validationRules={UserEmailValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={emailErrorMessages}
            autoFocus={true}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password.value}
            onValueChange={updatePassword}
            validationRules={UserPasswordValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={passwordErrorMessages}
          />,
        ]}
        actionButtons={[
          <SubmitButton
            label="Autentifică"
            onClick={async () => {
              toggleValidationMessage(true);
              await maybeSubmitForm({email, password});
            }}
          />,
        ]}
      />
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseState}`}>{serverResponse.responseText}</p>
      )}
    </PageLayout>
  );

  async function maybeSubmitForm(fields: Record<keyof TutorLoginDTO, ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("TutorLogin", {
      email: fields.email.value,
      password: fields.password.value,
    });

    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "LoginCheckSuccess":
        [responseState, responseText] = [ResponseState.ReceivedSuccess, "Autentificat."];
        break;
      case "EmailError":
        [responseState, responseText] = [ResponseState.ReceivedError, emailErrorMessages[response.errorCode]];
        break;
      case "PasswordError":
        [responseState, responseText] = [ResponseState.ReceivedError, passwordErrorMessages[response.errorCode]];
        break;
      case "UnknownEmailError":
        [responseState, responseText] = [
          ResponseState.ReceivedError,
          "Adresa de email nu este înregistrată în sistem.",
        ];
        break;
      case "IncorrectPasswordError":
        [responseState, responseText] = [ResponseState.ReceivedError, "Parola este incorectă"];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, dbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
        [responseState, responseText] = [ResponseState.ReceivedError, response.errorCode];
        break;
      case "TransportError":
        [responseState, responseText] = [ResponseState.ReceivedError, response.error];
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
