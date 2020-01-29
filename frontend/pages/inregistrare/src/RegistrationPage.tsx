import {runScenario, ResponseState, ServerResponse} from "frontend/shared/ScenarioRunner";
import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {ValidatedValue, UserValue, ValidationRules} from "shared/Utils/Validation";
import {
  FullNameValidationErrorCode,
  EmailValidationErrorCode,
  PasswordValidationErrorCode,
  UserModelValidationErrorCode,
  UserValidationRules,
  User,
} from "shared/Model/User";
import {assertNever} from "shared/Utils/Language";
import {DbErrorCode} from "shared/Model/Utils";
import {Checkbox} from "frontend/shared/Components/FormFields/Checkbox";

export function RegistrationPage() {
  const [fullName, updateFullName] = React.useState(initialFieldValue);
  const [email, updateEmail] = React.useState(initialFieldValue);
  const [password, updatePassword] = React.useState(initialFieldValue);
  const [hasAcceptUserLicenceAgreement, acceptUserLicenceAgreement] = React.useState(userLicenceAgreementInitialValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);

  return (
    <PageLayout title="Înregistrare tutore">
      <Form
        fields={[
          <TextField
            autoFocus
            id="fullName"
            label="Nume deplin"
            value={fullName.value}
            onValueChange={updateFullName}
            validationRules={validationRules.fullName}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={fullNameErrorMessages}
          />,
          <TextField
            id="email"
            label="Adresa de email"
            value={email.value}
            inputType="email"
            onValueChange={updateEmail}
            validationRules={validationRules.email}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={emailErrorMessages}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password.value}
            onValueChange={updatePassword}
            validationRules={validationRules.password}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={passwordErrorMessages}
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
              await submitForm({fullName, email, password});
            }}
          />,
        ]}
      />
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseState}`}>{serverResponse.responseText}</p>
      )}
    </PageLayout>
  );

  async function submitForm(fields: Record<FieldName, ValidatedValue<string>>): Promise<void> {
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
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, dbErrorMessages[response.errorCode]];
        break;
      case "ModelError":
        [responseState, responseText] = [ResponseState.ReceivedError, modelErrorMessages[response.errorCode]];
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

    setServerResponse({
      responseState,
      responseText,
      shouldShow: true,
    });
  }
}

const placeholderServerResponse: ServerResponse = {
  responseState: ResponseState.NotYetSent,
  responseText: "",
  shouldShow: false,
};

const initialFieldValue: ValidatedValue<string> = {
  value: "",
  isValid: false,
};

const userLicenceAgreementInitialValue: ValidatedValue<string> = {
  value: "off",
  isValid: false,
};

type FieldName = keyof Omit<User, "kind">;

const validationRules = UserValidationRules;

const fullNameErrorMessages: Record<FullNameValidationErrorCode, string> = {
  REQUIRED: "Numele deplin lipsește",
  TOO_SHORT: "Numele este prea scurt",
  TOO_LONG: "Numele este prea lung",
};

const emailErrorMessages: Record<EmailValidationErrorCode, string> = {
  REQUIRED: "Adresa de email lipsește",
  INCORRECT: "Adresa de email este invalidă",
};

const passwordErrorMessages: Record<PasswordValidationErrorCode, string> = {
  REQUIRED: "Parola lipsește",
};

const dbErrorMessages: Record<DbErrorCode, string> = {
  ERROR: "Eroare neprevăzută de bază de date",
};

const modelErrorMessages: Record<UserModelValidationErrorCode, string> = {
  EMAIL_TAKEN: "Există deja un cont cu această adresă de email",
};

// This is not included in UserValidationRules because it’s only used on the
// front-end.
type RequireAcceptance = "REQUIRE_ACCEPTANCE";

export const ulaValidationRules: ValidationRules<RequireAcceptance> = {
  REQUIRE_ACCEPTANCE: (value: UserValue) => value === "on",
};

const ulaErrorMessages: Record<RequireAcceptance, string> = {
  REQUIRE_ACCEPTANCE: "Este necesar să acceptați condițiile de utilizare",
};
