import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import {navigateToPage} from "frontend/shared/PageNavigation";
import {placeholderServerResponse, ResponseState, runScenario, ServerResponse} from "frontend/shared/ScenarioRunner";
import * as React from "react";
import {emailErrorMessages, UserEmailValidationRules} from "shared/Model/Email";
import {passwordErrorMessages, UserPasswordValidationRules} from "shared/Model/Password";
import {dbErrorMessages} from "shared/Model/Utils";
import {TutorLoginDTO} from "shared/Scenarios/TutorLogin";
import {assertNever} from "shared/Utils/Language";
import {initialFieldValue, ValidatedValue} from "shared/Utils/Validation";
import {PageProps} from "shared/Utils/PageProps";

export function TutorLoginPage(props: PageProps) {
  return (
    <PageLayout title="Autentificare repetitor">
      {props.isAuthenticated ? renderAlreadyLoggedState() : renderLoginForm()}
    </PageLayout>
  );
}

function renderAlreadyLoggedState() {
  return (
    <div>
      <p>Deja v-ați autentificat.</p>
      <p>
        Dacă doriți să vă dezautentifcați, apăsați pe acest buton:{" "}
        <button
          onClick={async () => {
            // const response = await runScenario("Logout", {});
          }}
        >
          Dezautentificare
        </button>
      </p>
    </div>
  );
}

function renderLoginForm() {
  const [email, updateEmail] = React.useState(initialFieldValue);
  const [password, updatePassword] = React.useState(initialFieldValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

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
    </>
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

    if (responseState === ResponseState.ReceivedSuccess) {
      navigateToPage("/");
    }

    setServerResponse({
      responseState,
      responseText,
      shouldShow: true,
    });
  }
}
