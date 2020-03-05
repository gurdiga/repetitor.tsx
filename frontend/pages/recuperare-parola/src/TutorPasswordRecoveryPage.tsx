import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {PageProps} from "shared/Utils/PageProps";
import {Form} from "frontend/shared/Components/Form";
import {ValidatedValue} from "shared/Utils/Validation";
import {ServerResponse, placeholderServerResponse, runScenario, ResponseState} from "frontend/shared/ScenarioRunner";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {UserEmailValidationRules, emailErrorMessages} from "shared/Model/Email";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {TutorPasswordRecoveryPropName} from "shared/Model/TutorPasswordRecovery";
import {assertNever} from "shared/Utils/Language";
import {dbErrorMessages} from "shared/Model/Utils";

export function TutorPasswordRecoveryPage(props: PageProps) {
  const [email, updateEmail] = React.useState(getEmailFromPageProps(props));

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  return (
    <PageLayout title="Recuperarea parolei">
      {serverResponse.responseState !== ResponseState.ReceivedSuccess && (
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
          ]}
          actionButtons={[
            <SubmitButton
              label="Recuperează parola"
              onClick={async () => {
                toggleValidationMessage(true);
                return await maybeSubmitForm({email});
              }}
            />,
          ]}
        />
      )}
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseState}`}>{serverResponse.responseText}</p>
      )}
    </PageLayout>
  );

  async function maybeSubmitForm(fields: Record<TutorPasswordRecoveryPropName, ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("TutorPasswordRecovery", {email: fields.email.value});
    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "TutorPasswordRecoveryEmailSent":
        [responseState, responseText] = [
          ResponseState.ReceivedSuccess,
          "Am trimis un mesaj cu instrucțiuni de recuperare a parolei.",
        ];
        break;
      case "EmailError":
        [responseState, responseText] = [ResponseState.ReceivedError, emailErrorMessages[response.errorCode]];
        break;
      case "UnknownEmailError":
        [responseState, responseText] = [
          ResponseState.ReceivedError,
          "Adresa de email nu este înregistrată în sistem.",
        ];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, dbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "TransportError":
      case "ServerError":
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

function getEmailFromPageProps(props: PageProps): ValidatedValue<string> {
  const {isAuthenticated, email} = props;

  if (!isAuthenticated) {
    return {
      value: "",
      isValid: false,
    };
  } else {
    if (email) {
      return {
        value: email,
        isValid: true,
      };
    } else {
      console.error("Email is missing on page props even if authenticated.");

      return {
        value: "",
        isValid: false,
      };
    }
  }
}
