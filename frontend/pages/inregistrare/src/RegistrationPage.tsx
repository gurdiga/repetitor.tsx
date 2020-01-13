import {postAction, ResponseState, ServerResponse} from "frontend/shared/ActionHandling";
import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {ActionRegistry} from "shared/ActionRegistry";
import {ValidatedValue, ValidationRules} from "shared/Validation";

export const RegistrationPage = () => {
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
            onClick={() => {
              toggleValidationMessage(true);
              submitForm({fullName, email, password});
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
      "error" in response
        ? [ResponseState.ReceivedError, errorMessages[response.error]]
        : [ResponseState.ReceivedSuccess, "Înregistrat."];

    setServerResponse({
      responseState,
      responseText,
      shouldShow: true,
    });
  }
};

const placeholderServerResponse: ServerResponse = {
  responseState: ResponseState.NotAskedYet,
  responseText: "",
  shouldShow: false,
};

const initialFieldValue: ValidatedValue = {
  text: "",
  isValid: false,
};

type FieldName = keyof ActionRegistry["RegisterUser"]["Params"];

const validationRules = ValidationRules["RegisterUser"];

const errorMessages = {
  EMAIL_REQUIRED: "Prezența adresei de email este obligatorie",
  PASSWORD_REQUIRED: "Prezența parolei este obligatorie",
  FULL_NAME_REQUIRED: "Prezența numelui este obligatorie",
  EMAIL_TAKEN: "Există deja un utilizator cu acest email",
  DB_ERROR: "Eroare de bază de date",
};
