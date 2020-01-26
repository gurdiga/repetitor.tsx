import {postAction, ResponseState, ServerResponse} from "frontend/shared/ActionHandling";
import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {ActionRegistry} from "shared/ActionRegistry";
import {ValidatedValue, ValidationRules} from "shared/Validation";
import {
  FullNameValidationErrorCode,
  EmailValidationErrorCode,
  PasswordValidationErrorCode,
  DbValidationErrorCode,
  ModelValidationErrorCode,
} from "shared/Domain/User";

export function RegistrationPage() {
  const [fullName, updateFullName] = React.useState(initialFieldValue);
  const [email, updateEmail] = React.useState(initialFieldValue);
  const [password, updatePassword] = React.useState(initialFieldValue);

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
            value={fullName.text}
            onValueChange={updateFullName}
            validationRules={validationRules.fullName}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={fullNameErrorMessages}
          />,
          <TextField
            id="email"
            label="Adresa de email"
            value={email.text}
            inputType="email"
            onValueChange={updateEmail}
            validationRules={validationRules.email}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={emailErrorMessages}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password.text}
            onValueChange={updatePassword}
            validationRules={validationRules.password}
            showValidationMessage={shouldShowValidationMessage}
            validationMessages={passwordErrorMessages}
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

  async function submitForm(fields: Record<FieldName, ValidatedValue>): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await postAction("RegisterUser", {
      fullName: fields.fullName.text,
      email: fields.email.text,
      password: fields.password.text,
    });

    // TODO: When I add a new `somethingError` this still compiles. Find a way
    // to type-check.
    const [responseState, responseText] =
      "emailError" in response
        ? [ResponseState.ReceivedError, emailErrorMessages[response.error]]
        : "fullNameError" in response
        ? [ResponseState.ReceivedError, fullNameErrorMessages[response.error]]
        : "passwordError" in response
        ? [ResponseState.ReceivedError, passwordErrorMessages[response.error]]
        : "modelError" in response
        ? [ResponseState.ReceivedError, modelErrorMessages[response.error]]
        : "dbError" in response
        ? [ResponseState.ReceivedError, dbErrorMessages[response.error]]
        : [ResponseState.ReceivedSuccess, "Înregistrat."]; // success

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

const initialFieldValue: ValidatedValue = {
  text: "",
  isValid: false,
};

type FieldName = keyof ActionRegistry["RegisterUser"]["Params"];

const validationRules = ValidationRules["RegisterUser"];

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

const dbErrorMessages: Record<DbValidationErrorCode, string> = {
  ERROR: "Eroare neprevăzută de bază de date",
};

const modelErrorMessages: Record<ModelValidationErrorCode, string> = {
  EMAIL_TAKEN: "Există deja un cont cu această adresă de email",
};
