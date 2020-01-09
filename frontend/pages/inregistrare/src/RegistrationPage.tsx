import * as React from "react";
import {ServerResponse, postAction, ResponseState} from "../../../shared/src/ActionHandling";
import {PageLayout} from "../../../shared/src/PageLayout";
import {Form} from "../../../shared/src/Components/Form";
import {TextField} from "../../../shared/src/Components/FormFields/TextField";
import {PasswordField} from "../../../shared/src/Components/FormFields/PasswordField";
import {SubmitButton} from "../../../shared/src/Components/SubmitButton";
import {FormValidation} from "../../../shared/src/FormValidation";
import {ActionDirectory} from "../../../../shared/src/ActionDirectory";

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

  async function submitForm(fields: Record<FieldName, FormValidation.ValidatedValue>): Promise<void> {
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

const initialFieldValue: FormValidation.ValidatedValue = {
  text: "",
  isValid: false,
};

type FieldName = keyof ActionDirectory["RegisterUser"]["Params"];

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

const errorMessages = {
  EMAIL_REQUIRED: "Prezența adresei de email este obligatorie",
  PASSWORD_REQUIRED: "Prezența parolei este obligatorie",
  FULL_NAME_REQUIRED: "Prezența numelui este obligatorie",
  EMAIL_TAKEN: "Există deja un utilizator cu acest email",
  DB_ERROR: "Eroare de bază de date",
};
