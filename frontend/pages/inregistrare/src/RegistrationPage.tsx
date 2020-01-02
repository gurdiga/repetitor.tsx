import * as React from "react";
import {ServerResponse, ActionName, postAction, ServerResponseType} from "../../../shared/src/Actions";
import {PageLayout} from "../../../shared/src/PageLayout";
import {Form} from "../../../shared/src/Components/Form";
import {TextField} from "../../../shared/src/Components/FormFields/TextField";
import {PasswordField} from "../../../shared/src/Components/FormFields/PasswordField";
import {SubmitButton} from "../../../shared/src/Components/SubmitButton";
import {FormValidation} from "../../../shared/src/FormValidation";

export const RegistrationPage = () => {
  const [fullName, validateFullName] = React.useState(initialFieldValue);
  const [email, validateEmail] = React.useState(initialFieldValue);
  const [password, validatePassword] = React.useState(initialFieldValue);

  const [showValidationMessage, setShowValidationMessage] = React.useState(false);
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
            onValueChange={validateFullName}
            validationRules={validationRules.fullName}
            showValidationMessage={showValidationMessage}
          />,
          <TextField
            id="email"
            label="Adresa de email"
            value={email.text}
            inputType="email"
            onValueChange={validateEmail}
            validationRules={validationRules.email}
            showValidationMessage={showValidationMessage}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password.text}
            onValueChange={validatePassword}
            validationRules={validationRules.password}
            showValidationMessage={showValidationMessage}
          />,
        ]}
        actionButtons={[
          <SubmitButton
            label="Înregistrează"
            onClick={() => {
              setShowValidationMessage(true);
              submitForm("RegisterUser", {fullName, email, password});
            }}
          />,
        ]}
      />
      {serverResponse.shouldShow && (
        <p className={`server-response-${serverResponse.responseType}`}>{serverResponse.responseText}</p>
      )}
    </PageLayout>
  );

  async function submitForm(
    actionName: ActionName,
    fields: Record<FieldName, FormValidation.ValidatedValue>
  ): Promise<void> {
    const anyInvalidField = Object.values(fields).some(f => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const fieldValues: {[fieldName: string]: string} = {};

    Object.entries(fields).forEach(([fieldName, {text}]) => {
      fieldValues[fieldName] = text;
    });

    const response = await postAction(actionName, fieldValues);
    const [responseType, responseText]: [ServerResponseType, string] =
      "error" in response ? ["error", getErrorMessageByErrorResponseCode(response.error)] : ["success", "Înregistrat."];

    setServerResponse({
      responseType,
      responseText,
      shouldShow: true,
    });
  }
};

const placeholderServerResponse: ServerResponse = {
  responseType: "notAskedYet",
  responseText: "",
  shouldShow: false,
};

type RegisterUserResponseCode = "EMAIL_TAKEN" | "DB_ERROR";

function getErrorMessageByErrorResponseCode(code: RegisterUserResponseCode): string {
  switch (code) {
    case "EMAIL_TAKEN":
      return "Există deja un utilizator cu acest email";
    case "DB_ERROR":
      return "Eroare de bază de date.";
  }
}

const initialFieldValue: FormValidation.ValidatedValue = {
  text: "",
  isValid: false,
};

type FieldName = "fullName" | "email" | "password";

const validationRules: Record<FieldName, FormValidation.ValidationRules> = {
  fullName: {
    "Numele lipsește.": (text: string) => text.trim().length === 0,
    "Numele pare să fie prea scurt.": (text: string) => text.trim().length < 5,
    "Numele pare să fie prea lung.": (text: string) => text.trim().length > 50,
  },
  email: {
    "Adresa de email lipsește.": (text: string) => text.trim().length == 0,
    "Adresa de pare să fie incorectă.": (text: string) => !text.includes("@"),
  },
  password: {
    "Parola lipsește.": (text: string) => text.trim().length == 0,
  },
};
