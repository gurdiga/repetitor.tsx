import {postAction, ResponseState, ServerResponse} from "frontend/shared/ActionHandling";
import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {ActionRegistry} from "shared/ActionRegistry";
import {ValidatedValue, ValidationRules} from "shared/Validation";

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
          />,
          <TextField
            id="email"
            label="Adresa de email"
            value={email.text}
            inputType="email"
            onValueChange={updateEmail}
            validationRules={validationRules.email}
            showValidationMessage={shouldShowValidationMessage}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password.text}
            onValueChange={updatePassword}
            validationRules={validationRules.password}
            showValidationMessage={shouldShowValidationMessage}
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

    const [responseState, responseText] =
      "emailError" in response
        ? [ResponseState.ReceivedError, emailErrorMessages[response.error]]
        : "fullNameError" in response
        ? [ResponseState.ReceivedError, fullNameErrorMessages[response.error]]
        : "passwordError" in response
        ? [ResponseState.ReceivedError, passwordErrorMessages[response.error]]
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

const emailErrorMessages = {
  REQUIRED: "Adresa de email lipsește",
  INVALID: "Adresa de email este invalidă",
  TAKEN: "Existe deja un cont cu această adresă de email",
};

const fullNameErrorMessages = {
  REQUIRED: "Prezența numelui este obligatorie",
};

const passwordErrorMessages = {
  REQUIRED: "Prezența numelui este obligatorie",
};

const dbErrorMessages = {
  ERROR: "Prezența numelui este obligatorie",
};
