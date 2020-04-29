import {Form} from "frontend/shared/src/Components/Form";
import {PasswordField} from "frontend/shared/src/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import * as React from "react";
import {EmailErrorMessages, EmailValidationRules} from "shared/src/Model/Email";
import {PasswordErrorMessages, PasswordValidationRules} from "shared/src/Model/Password";
import {PasswordResetStep1PropName} from "shared/src/Model/PasswordResetStep1";
import {
  PasswordResetStep2PropName,
  PasswordResetTokenValidationRules,
  TokenErrorMessages,
} from "shared/src/Model/PasswordResetStep2";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {PageProps} from "shared/src/Utils/PageProps";
import {emptyFieldValue, ValidatedValue, validateWithRules} from "shared/src/Utils/Validation";

interface Props extends PageProps {
  params: QueryStringParams;
}

export function PasswordResetPage(props: Props) {
  const {isAuthenticated, params} = props;
  const {token} = params;

  return (
    <PageLayout {...{title: "Resetarea parolei", isAuthenticated}}>
      {token ? renderStep2(token) : renderStep1(props)}
    </PageLayout>
  );
}

function renderStep1(props: PageProps) {
  const {isAuthenticated} = props;
  const [email, updateEmail] = React.useState(getEmailFromPageProps(props));

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [shouldShowServerRequestState, toggleServerRequestState] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <>
      {isAuthenticated ? (
        <p>Veți primi un mesaj cu instrucțiuni pe adresa dumneavoastră de email.</p>
      ) : (
        !shouldShowServerRequestState && (
          <p>
            Pentru a reseta parola, introduceți adresa de email pe care ați folosit-o la înregistare. Veți primi un
            mesaj cu instrucțiuni.
          </p>
        )
      )}
      {serverResponse.requestState !== RequestState.ReceivedSuccess && (
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
              readOnly={isAuthenticated}
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
      {shouldShowServerRequestState && (
        <p className={`server-response-${serverResponse.requestState}`}>{serverResponse.statusText}</p>
      )}
    </>
  );

  async function maybeSubmitForm(fields: Record<PasswordResetStep1PropName, ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some((f) => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("PasswordResetStep1", {email: fields.email.value});
    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "PasswordResetEmailSent":
        [requestState, statusText] = [
          RequestState.ReceivedSuccess,
          `Verificați cutia poștală ${fields.email.value}. Am trimis un mesaj cu instrucțiuni de resetare a parolei.`,
        ];
        break;
      case "EmailError":
        [requestState, statusText] = [RequestState.ReceivedError, EmailErrorMessages[response.errorCode]];
        break;
      case "UnknownEmailError":
        [requestState, statusText] = [RequestState.ReceivedError, "Adresa de email nu este înregistrată în sistem."];
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

    setServerResponse({requestState, statusText});
    toggleServerRequestState(true);
  }
}

function renderStep2(tokenString: string) {
  const [newPassword, updateNewPassword] = React.useState(emptyFieldValue);

  const tokenValidationResult = validateWithRules(tokenString, PasswordResetTokenValidationRules);
  const token = {value: tokenString, isValid: tokenValidationResult.kind === "Valid"};

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [shouldShowServerRequestState, toggleServerRequestState] = React.useState(false);
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <>
      {serverRequest.requestState !== RequestState.ReceivedSuccess && (
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
                validationRules={PasswordValidationRules}
                showValidationMessage={shouldShowValidationMessage}
                validationMessages={PasswordErrorMessages}
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
      {shouldShowServerRequestState && (
        <p className={`server-response-${serverRequest.requestState}`}>{serverRequest.statusText}</p>
      )}
    </>
  );

  async function maybeSubmitForm(fields: Record<PasswordResetStep2PropName, ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some((f) => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("PasswordResetStep2", {
      token: fields.token.value,
      newPassword: fields.newPassword.value,
    });

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "PasswordResetSuccess":
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Parola a fost resetată cu succes."];
        break;
      case "PasswordResetTokenUnknownError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          "Sesiunea de resetare a parolei a expirat. Mai încercați odată resetarea parolei de la început.",
        ];
        break;
      case "PasswordError":
        [requestState, statusText] = [RequestState.ReceivedError, PasswordErrorMessages[response.errorCode]];
        break;
      case "PasswordResetTokenError":
        [requestState, statusText] = [RequestState.ReceivedError, TokenErrorMessages[response.errorCode]];
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
