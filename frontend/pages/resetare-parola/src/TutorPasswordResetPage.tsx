import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {PageProps} from "shared/Utils/PageProps";
import {Form} from "frontend/shared/Components/Form";
import {ValidatedValue, emptyFieldValue, validateWithRules} from "shared/Utils/Validation";
import {ServerResponse, placeholderServerResponse, runScenario, ResponseState} from "frontend/shared/ScenarioRunner";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {UserEmailValidationRules, emailErrorMessages} from "shared/Model/Email";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {TutorPasswordResetStep1PropName} from "shared/Model/TutorPasswordResetStep1";
import {assertNever} from "shared/Utils/Language";
import {dbErrorMessages} from "shared/Model/Utils";
import {QueryStringParams} from "frontend/shared/Utils/QueryStringParams";
import {
  tokenErrorMessages,
  TutorPasswordResetStep2PropName,
  PasswordResetTokenValidationRules,
} from "shared/Model/TutorPasswordResetStep2";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {UserPasswordValidationRules, passwordErrorMessages} from "shared/Model/Password";

interface TutorPasswordResetPageProps extends PageProps {
  params: QueryStringParams;
}

export function TutorPasswordResetPage(props: TutorPasswordResetPageProps) {
  const {token} = props.params;

  return <PageLayout title="Resetarea parolei">{token ? renderStep2(token) : renderStep1(props)}</PageLayout>;
}

function renderStep1(props: PageProps) {
  const [email, updateEmail] = React.useState(getEmailFromPageProps(props));

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  return (
    <>
      <p>
        Pentru a reseta parola, introduceți adresa de email pe care ați folosit-o la înregistare. Veți primi un mesaj cu
        instrucțiuni.
      </p>
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
              label="Trimite instrucțiuni"
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
    </>
  );

  async function maybeSubmitForm(
    fields: Record<TutorPasswordResetStep1PropName, ValidatedValue<string>>
  ): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("TutorPasswordResetStep1", {email: fields.email.value});
    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "TutorPasswordResetEmailSent":
        [responseState, responseText] = [
          ResponseState.ReceivedSuccess,
          "Am trimis un mesaj cu instrucțiuni de resetare a parolei.",
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

function renderStep2(tokenString: string) {
  const [newPassword, updateNewPassword] = React.useState(emptyFieldValue);

  const tokenValidationResult = validateWithRules(tokenString, PasswordResetTokenValidationRules);
  const token = {value: tokenString, isValid: tokenValidationResult.kind === "Valid"};

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  return (
    <>
      <p>Introduceți parola nouă.</p>
      {serverResponse.responseState !== ResponseState.ReceivedSuccess && (
        <Form
          fields={[
            <PasswordField
              id="new-password"
              label="Parola nouă"
              value={newPassword.value}
              hasGenerateButton={true}
              onValueChange={updateNewPassword}
              validationRules={UserPasswordValidationRules}
              showValidationMessage={shouldShowValidationMessage}
              validationMessages={passwordErrorMessages}
              autoFocus={true}
            />,
          ]}
          actionButtons={[
            <SubmitButton
              label="Resetează"
              onClick={async () => {
                toggleValidationMessage(true);
                return await maybeSubmitForm({newPassword, token});
              }}
            />,
          ]}
        />
      )}
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseState}`}>{serverResponse.responseText}</p>
      )}
    </>
  );

  async function maybeSubmitForm(
    fields: Record<TutorPasswordResetStep2PropName, ValidatedValue<string>>
  ): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("TutorPasswordResetStep2", {
      token: fields.token.value,
      newPassword: fields.newPassword.value,
    });

    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "TutorPasswordResetSuccess":
        [responseState, responseText] = [ResponseState.ReceivedSuccess, "Parola a fost resetată cu succes."];
        break;
      case "PasswordResetTokenUnknownError":
        [responseState, responseText] = [
          ResponseState.ReceivedError,
          "Tokenul este expirat. Mai încercați odată resetarea parolei de la început.",
        ];
        break;
      case "PasswordResetTokenError":
        [responseState, responseText] = [ResponseState.ReceivedError, tokenErrorMessages[response.errorCode]];
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
