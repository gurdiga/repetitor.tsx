import {AlreadyLoggedIn} from "frontend/shared/src/Components/AlreadyLoggedIn";
import {Form} from "frontend/shared/src/Components/Form";
import {Checkbox} from "frontend/shared/src/Components/FormFields/Checkbox";
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
import {emailErrorMessages, UserEmailValidationRules} from "shared/src/Model/Email";
import {passwordErrorMessages, UserPasswordValidationRules} from "shared/src/Model/Password";
import {
  TutorFullNameValidationRules,
  TutorPropName,
  UserModelValidationErrorCode,
  FullNameErrorMessages,
} from "shared/src/Model/Tutor";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {PageProps} from "shared/src/Utils/PageProps";
import {ErrorMessages, emptyFieldValue, UserValue, ValidatedValue, ValidationRules} from "shared/src/Utils/Validation";
import {PagePath} from "shared/src/Utils/PagePath";
import {AlertMessage, AlertType} from "frontend/shared/src/Components/AlertMessage";

export function TutorRegistrationPage(props: PageProps) {
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
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);
  const shouldShowServerResponse =
    serverResponse.shouldShow &&
    (serverResponse.responseState === ResponseState.ReceivedError ||
      serverResponse.responseState === ResponseState.ReceivedSuccess);

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
            validationRules={TutorFullNameValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={FullNameErrorMessages}
            info="Va fi afișat pe pagina dumneavoastră de profil"
          />,
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
      {serverResponse.shouldShow &&
        (serverResponse.responseState === ResponseState.ReceivedError ||
          serverResponse.responseState === ResponseState.ReceivedSuccess) && (
          <AlertMessage type={getAlertTypeFromResponseState(serverResponse.responseState)}>
            {serverResponse.responseText}
          </AlertMessage>
        )}
    </>
  );

  function getAlertTypeFromResponseState(
    responseState: ResponseState.ReceivedError | ResponseState.ReceivedSuccess
  ): AlertType {
    switch (responseState) {
      case ResponseState.ReceivedError:
        return "error";
      case ResponseState.ReceivedSuccess:
        return "success";
    }
  }

  async function maybeSubmitForm(
    fields: Record<TutorPropName | "hasAcceptUserLicenceAgreement", ValidatedValue<string>>
  ): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("TutorRegistration", {
      fullName: fields.fullName.value,
      email: fields.email.value,
      password: fields.password.value,
    });

    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "TutorCreationSuccess":
        [responseState, responseText] = [ResponseState.ReceivedSuccess, "Înregistrat."];
        break;
      case "FullNameError":
        [responseState, responseText] = [ResponseState.ReceivedError, FullNameErrorMessages[response.errorCode]];
        break;
      case "EmailError":
        [responseState, responseText] = [ResponseState.ReceivedError, emailErrorMessages[response.errorCode]];
        break;
      case "PasswordError":
        [responseState, responseText] = [ResponseState.ReceivedError, passwordErrorMessages[response.errorCode]];
        break;
      case "ModelError":
        [responseState, responseText] = [ResponseState.ReceivedError, UserModelErrorMessages[response.errorCode]];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "ServerError":
      case "TransportError":
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

const UserModelErrorMessages: ErrorMessages<UserModelValidationErrorCode> = {
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
