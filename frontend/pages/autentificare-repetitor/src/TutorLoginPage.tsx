import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {Form} from "frontend/shared/Components/Form";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {
  UserEmailValidationRules,
  UserPasswordValidationRules,
  emailErrorMessages,
  passwordErrorMessages,
  UserPropName,
} from "shared/Model/User";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {initialFieldValue, ValidatedValue} from "shared/Utils/Validation";
import {ServerResponse, runScenario, ResponseState, placeholderServerResponse} from "frontend/shared/ScenarioRunner";
import {assertNever} from "shared/Utils/Language";
import {dbErrorMessages} from "shared/Model/Utils";

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
            label="Înregistrează"
            onClick={async () => {
              toggleValidationMessage(true);
              await submitForm({email, password} as any); // TODO fix this
            }}
          />,
        ]}
      />
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseState}`}>{serverResponse.responseText}</p>
      )}
    </PageLayout>
  );

  async function submitForm(fields: Record<UserPropName, ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("UserRegistration", {
      fullName: fields.fullName.value,
      email: fields.email.value,
      password: fields.password.value,
    });

    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "Success":
        [responseState, responseText] = [ResponseState.ReceivedSuccess, "Înregistrat."];
        break;
      case "EmailError":
        [responseState, responseText] = [ResponseState.ReceivedError, emailErrorMessages[response.errorCode]];
        break;
      case "PasswordError":
        [responseState, responseText] = [ResponseState.ReceivedError, passwordErrorMessages[response.errorCode]];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, dbErrorMessages[response.errorCode]];
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
      // assertNever(response); // TODO fix this
    }

    // setServerResponse({ // TODO fix this
    //   responseState,
    //   responseText,
    //   shouldShow: true,
    // });
  }
}
