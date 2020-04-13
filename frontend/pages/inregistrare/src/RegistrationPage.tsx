import {AlreadyLoggedIn} from "frontend/shared/src/Components/AlreadyLoggedIn";
import {Form} from "frontend/shared/src/Components/Form";
import {Checkbox} from "frontend/shared/src/Components/FormFields/Checkbox";
import {PasswordField} from "frontend/shared/src/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {navigateToPage} from "frontend/shared/src/PageNavigation";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import * as React from "react";
import {EmailErrorMessages, EmailValidationRules} from "shared/src/Model/Email";
import {PasswordErrorMessages, PasswordValidationRules} from "shared/src/Model/Password";
import {
  FullNameValidationRules,
  AccountPropName,
  AccountModelValidationErrorCode,
  FullNameErrorMessages,
} from "shared/src/Model/Account";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {PageProps} from "shared/src/Utils/PageProps";
import {ErrorMessages, emptyFieldValue, UserValue, ValidatedValue, ValidationRules} from "shared/src/Utils/Validation";
import {PagePath} from "shared/src/Utils/PagePath";
import {AlertMessage, AlertType, getAlertTypeForRequestState} from "frontend/shared/src/Components/AlertMessage";

export function RegistrationPage(props: PageProps) {
  const {isAuthenticated} = props;

  return (
    <PageLayout {...{title: "Înregistrare repetitor", isAuthenticated}}>
      {props.isAuthenticated ? renderAlreadyLoggedState() : renderLoginForm()}
    </PageLayout>
  );
}

function renderAlreadyLoggedState() {
  return (
    <AlreadyLoggedIn>
      <p>Deja v-ați înregistrat.</p>
      <p>Dacă doriți să vă dezautentifcați, apăsați pe acest buton:</p>
    </AlreadyLoggedIn>
  );
}

function renderLoginForm() {
  const [fullName, updateFullName] = React.useState(emptyFieldValue);
  const [email, updateEmail] = React.useState(emptyFieldValue);
  const [password, updatePassword] = React.useState(emptyFieldValue);
  const [hasAcceptUserLicenceAgreement, acceptUserLicenceAgreement] = React.useState(UlaInitialValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [shouldShowServerRequestState, toggleServerRequestState] = React.useState(false);
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <>
      <Form
        fields={[
          <TextField
            autoFocus
            id="fullName"
            label="Nume deplin"
            value={fullName.value}
            onValueChange={updateFullName}
            validationRules={FullNameValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={FullNameErrorMessages}
            additionalControls="Va fi afișat pe pagina dumneavoastră de profil"
          />,
          <TextField
            id="email"
            label="Adresa de email"
            value={email.value}
            inputType="email"
            onValueChange={updateEmail}
            validationRules={EmailValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={EmailErrorMessages}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password.value}
            onValueChange={updatePassword}
            validationRules={PasswordValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={PasswordErrorMessages}
            hasGenerateButton={true}
          />,
          <Checkbox
            id="userLicenceAgreement"
            value={hasAcceptUserLicenceAgreement.value}
            onValueChange={acceptUserLicenceAgreement}
            validationRules={UlaValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={UlaErrorMessages}
            label={
              <>
                Sunt de acord cu <a href="/conditii">condițiile de utilizare</a>
              </>
            }
          />,
        ]}
        actionButtons={[
          <SubmitButton
            label="Înregistrează"
            onClick={async () => {
              toggleValidationMessage(true);
              await maybeSubmitForm({fullName, email, password, hasAcceptUserLicenceAgreement});
            }}
          />,
        ]}
      />
      {shouldShowServerRequestState &&
        (serverRequest.requestState === RequestState.ReceivedError ||
          serverRequest.requestState === RequestState.ReceivedSuccess) && (
          <AlertMessage type={getAlertTypeForRequestState(serverRequest.requestState)}>
            {serverRequest.statusText}
          </AlertMessage>
        )}
    </>
  );

  async function maybeSubmitForm(
    fields: Record<AccountPropName | "hasAcceptUserLicenceAgreement", ValidatedValue<string>>
  ): Promise<void> {
    const anyInvalidField = Object.values(fields).some((f) => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("Registration", {
      fullName: fields.fullName.value,
      email: fields.email.value,
      password: fields.password.value,
    });

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "AccountCreationSuccess":
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Înregistrat."];
        break;
      case "FullNameError":
        [requestState, statusText] = [RequestState.ReceivedError, FullNameErrorMessages[response.errorCode]];
        break;
      case "EmailError":
        [requestState, statusText] = [RequestState.ReceivedError, EmailErrorMessages[response.errorCode]];
        break;
      case "PasswordError":
        [requestState, statusText] = [RequestState.ReceivedError, PasswordErrorMessages[response.errorCode]];
        break;
      case "AccountModelError":
        [requestState, statusText] = [RequestState.ReceivedError, AccountModelErrorMessages[response.errorCode]];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "ServerError":
      case "TransportError":
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

const AccountModelErrorMessages: ErrorMessages<AccountModelValidationErrorCode> = {
  EMAIL_TAKEN: "Există deja un cont cu această adresă de email",
};

const UlaInitialValue: ValidatedValue<string> = {
  value: "off",
  isValid: false,
};

// This is not included in UserValidationRules because it’s only used on the
// front-end.
type RequireAcceptance = "REQUIRE_ACCEPTANCE";

export const UlaValidationRules: ValidationRules<RequireAcceptance> = {
  REQUIRE_ACCEPTANCE: (value: UserValue) => value === "on",
};

const UlaErrorMessages: ErrorMessages<RequireAcceptance> = {
  REQUIRE_ACCEPTANCE: "Este necesar să acceptați condițiile de utilizare",
};
