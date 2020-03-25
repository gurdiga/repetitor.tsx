import {Form} from "frontend/shared/src/Components/Form";
import {PasswordField} from "frontend/shared/src/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {
  placeholderServerResponse,
  ResponseState,
  runScenario,
  ServerResponse,
} from "frontend/shared/src/ScenarioRunner";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import * as React from "react";
import {emailErrorMessages, UserEmailValidationRules} from "shared/src/Model/Email";
import {passwordErrorMessages, UserPasswordValidationRules} from "shared/src/Model/Password";
import {TutorPasswordResetStep1PropName} from "shared/src/Model/TutorPasswordResetStep1";
import {
  PasswordResetTokenValidationRules,
  tokenErrorMessages,
  TutorPasswordResetStep2PropName,
} from "shared/src/Model/TutorPasswordResetStep2";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {PageProps} from "shared/src/Utils/PageProps";
import {emptyFieldValue, ValidatedValue, validateWithRules} from "shared/src/Utils/Validation";

interface Props extends PageProps {
  params: QueryStringParams;
}

export function TutorPasswordResetPage(props: Props) {
  const {token} = props.params;

  return <PageLayout title="Resetarea parolei">{token ? renderStep2(token) : renderStep1(props)}</PageLayout>;
}

function renderStep1(props: PageProps) {
  const [email, updateEmail] = React.useState(getEmailFromPageProps(props));

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  return (
    <>
      {!serverResponse.shouldShow && (
        <p>
          Pentru a reseta parola, introduceți adresa de email pe care ați folosit-o la înregistare. Veți primi un mesaj
          cu instrucțiuni.
        </p>
      )}
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
          `Verificați cutia poștală ${fields.email.value}. Am trimis un mesaj cu instrucțiuni de resetare a parolei.`,
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
        [responseState, responseText] = [ResponseState.ReceivedError, DbErrorMessages[response.errorCode]];
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
      {serverResponse.responseState !== ResponseState.ReceivedSuccess && (
        <>
          <p>Introduceți parola nouă.</p>
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
        </>
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
          "Sesiunea de resetare a parolei a expirat. Mai încercați odată resetarea parolei de la început.",
        ];
        break;
      case "PasswordError":
        [responseState, responseText] = [ResponseState.ReceivedError, passwordErrorMessages[response.errorCode]];
        break;
      case "PasswordResetTokenError":
        [responseState, responseText] = [ResponseState.ReceivedError, tokenErrorMessages[response.errorCode]];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, DbErrorMessages[response.errorCode]];
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
