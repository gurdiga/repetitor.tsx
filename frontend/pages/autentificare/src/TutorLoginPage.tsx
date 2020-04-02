import {ResetPasswordLinkContainer} from "frontend/pages/autentificare/src/TutorLoginPage.css";
import {AlreadyLoggedIn} from "frontend/shared/src/Components/AlreadyLoggedIn";
import {Form} from "frontend/shared/src/Components/Form";
import {PasswordField} from "frontend/shared/src/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {navigateToPage} from "frontend/shared/src/PageNavigation";
import {
  placeholderServerResponse,
  ResponseState,
  runScenario,
  ServerResponse,
} from "frontend/shared/src/ScenarioRunner";
import * as React from "react";
import {EmailErrorMessages, EmailValidationRules} from "shared/src/Model/Email";
import {PasswordErrorMessages, PasswordValidationRules} from "shared/src/Model/Password";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {TutorLoginInput} from "shared/src/Scenarios/TutorLogin";
import {assertNever} from "shared/src/Utils/Language";
import {PageProps} from "shared/src/Utils/PageProps";
import {emptyFieldValue, ValidatedValue} from "shared/src/Utils/Validation";
import {PagePath} from "shared/src/Utils/PagePath";

export function TutorLoginPage(props: PageProps) {
  const {isAuthenticated} = props;

  return (
    <PageLayout {...{title: "Autentificare repetitor", isAuthenticated}}>
      {props.isAuthenticated ? renderAlreadyLoggedState() : renderLoginForm()}
    </PageLayout>
  );
}

function renderAlreadyLoggedState() {
  return (
    <AlreadyLoggedIn>
      <p>Deja v-ați autentificat.</p>
      <p>Dacă doriți să vă dezautentifcați, apăsați pe acest buton:</p>
    </AlreadyLoggedIn>
  );
}

function renderLoginForm() {
  const [email, updateEmail] = React.useState(emptyFieldValue);
  const [password, updatePassword] = React.useState(emptyFieldValue);

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
            info={
              <div className={ResetPasswordLinkContainer}>
                <a href={PagePath.TutorPasswordReset}>Resetare parolă</a>
              </div>
            }
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
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseState}`}>{serverResponse.responseText}</p>
      )}
    </>
  );

  async function maybeSubmitForm(fields: Record<keyof TutorLoginInput, ValidatedValue<string>>): Promise<void> {
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
        [responseState, responseText] = [ResponseState.ReceivedError, EmailErrorMessages[response.errorCode]];
        break;
      case "PasswordError":
        [responseState, responseText] = [ResponseState.ReceivedError, PasswordErrorMessages[response.errorCode]];
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
        [responseState, responseText] = [ResponseState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
        [responseState, responseText] = [ResponseState.ReceivedError, response.error];
        break;
      case "TransportError":
      case "ServerError":
        [responseState, responseText] = [ResponseState.ReceivedError, response.error];
        break;
      default:
        assertNever(response);
    }

    if (responseState === ResponseState.ReceivedSuccess) {
      navigateToPage(PagePath.Home);
    }

    setServerResponse({
      responseState,
      responseText,
      shouldShow: true,
    });
  }
}
