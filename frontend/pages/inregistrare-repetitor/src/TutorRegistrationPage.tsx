import {Form} from "frontend/shared/Components/Form";
import {Checkbox} from "frontend/shared/Components/FormFields/Checkbox";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import {placeholderServerResponse, ResponseState, runScenario, ServerResponse} from "frontend/shared/ScenarioRunner";
import * as React from "react";
import {emailErrorMessages, UserEmailValidationRules} from "shared/Model/Email";
import {passwordErrorMessages, UserPasswordValidationRules} from "shared/Model/Password";
import {TutorFullNameValidationRules, UserModelValidationErrorCode, TutorPropName} from "shared/Model/Tutor";
import {dbErrorMessages} from "shared/Model/Utils";
import {assertNever} from "shared/Utils/Language";
import {
  ErrorMessages,
  initialFieldValue,
  UserValue,
  ValidatedValue,
  ValidationMessages,
  ValidationRules,
} from "shared/Utils/Validation";

export function TutorRegistrationPage() {
  const [fullName, updateFullName] = React.useState(initialFieldValue);
  const [email, updateEmail] = React.useState(initialFieldValue);
  const [password, updatePassword] = React.useState(initialFieldValue);
  const [hasAcceptUserLicenceAgreement, acceptUserLicenceAgreement] = React.useState(userLicenceAgreementInitialValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  return (
    <PageLayout title="Înregistrare repetitor">
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
            validationMessages={fullNameErrorMessages}
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
            validationRules={ulaValidationRules}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={ulaErrorMessages}
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
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseState}`}>{serverResponse.responseText}</p>
      )}
    </PageLayout>
  );

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
        [responseState, responseText] = [ResponseState.ReceivedError, fullNameErrorMessages[response.errorCode]];
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
      case "ModelError":
        [responseState, responseText] = [ResponseState.ReceivedError, modelErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
        [responseState, responseText] = [ResponseState.ReceivedError, response.error];
        break;
      case "ServerError":
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

const userLicenceAgreementInitialValue: ValidatedValue<string> = {
  value: "off",
  isValid: false,
};

const fullNameErrorMessages: ValidationMessages<typeof TutorFullNameValidationRules> = {
  REQUIRED: "Numele deplin lipsește",
  TOO_SHORT: "Numele este prea scurt",
  TOO_LONG: "Numele este prea lung",
};

const modelErrorMessages: ErrorMessages<UserModelValidationErrorCode> = {
  EMAIL_TAKEN: "Există deja un cont cu această adresă de email",
};

// This is not included in UserValidationRules because it’s only used on the
// front-end.
type RequireAcceptance = "REQUIRE_ACCEPTANCE";

export const ulaValidationRules: ValidationRules<RequireAcceptance> = {
  REQUIRE_ACCEPTANCE: (value: UserValue) => value === "on",
};

const ulaErrorMessages: ErrorMessages<RequireAcceptance> = {
  REQUIRE_ACCEPTANCE: "Este necesar să acceptați condițiile de utilizare",
};
