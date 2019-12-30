import * as React from "react";

import {PageLayout} from "Common/PageLayout";
import {Form} from "Common/Components/Form";
import {TextField} from "Common/Components/FormFields/TextField";
import {PasswordField} from "Common/Components/FormFields/PasswordField";
import {SubmitButton} from "Common/Components/SubmitButton";
import {FormValidation} from "Common/FormValidation";

export const RegistrationPage = () => {
  const [fullName, validateFullName] = React.useState(initialFieldValue);
  const [email, validateEmail] = React.useState(initialFieldValue);
  const [password, validatePassword] = React.useState(initialFieldValue);

  const [showValidationMessage, setShowValidationMessage] = React.useState(false);

  const submitForm = () => {
    setShowValidationMessage(true);

    const fields = {fullName, email, password};
    const allFiledsAreValid = Object.values(fields).every(f => f.isValid);

    if (allFiledsAreValid) {
      const fieldValues: {[fieldName: string]: string} = {};

      Object.entries(fields).forEach(([fieldName, {text}]) => {
        fieldValues[fieldName] = text;
      });

      sendFieldValues(fieldValues);
    }
  };

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
        actionButtons={[<SubmitButton label="Înregistrează" onClick={submitForm} />]}
      />
    </PageLayout>
  );
};

const initialFieldValue: FormValidation.ValidatedValue = {
  text: "",
  isValid: false,
};

type FieldName = "fullName" | "email" | "password";

const validationRules: Record<FieldName, FormValidation.ValidationRules> = {
  fullName: {
    "Numele lipsește.": text => text.trim().length === 0,
    "Numele pare să fie prea scurt.": text => text.trim().length < 5,
    "Numele pare să fie prea lung.": text => text.trim().length > 50,
  },
  email: {
    "Adresa de email lipsește.": text => text.trim().length == 0,
    "Adresa de pare să fie incorectă.": text => !text.includes("@"),
  },
  password: {
    "Parola lipsește.": text => text.trim().length == 0,
  },
};

async function sendFieldValues(fieldValues: {[fieldName: string]: string}): Promise<any> {
  console.log(fieldValues);

  return await postData("http://localhost:8084", fieldValues).then(data => {
    console.log(data);
  });
}

async function postData(url: string, data: any): Promise<any> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actionName: "RegisterUser",
      actionParams: data,
    }),
    redirect: "error",
    cache: "no-store",
  });

  return await response.json();
}
