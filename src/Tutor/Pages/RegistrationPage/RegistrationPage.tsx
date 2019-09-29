import * as React from "react";

import {PageLayout} from "Common/PageLayout";
import {Form} from "Common/Components/Form";
import {TextField} from "Common/Components/FormFields/TextField";
import {PasswordField} from "Common/Components/FormFields/PasswordField";
import {SubmitButton} from "Common/Components/SubmitButton";
import {FormValidation} from "Common/FormValidation";

export const RegistrationPage = () => {
  const [showValidationMessage, setShowValidationMessage] = React.useState(false);
  const [[fullName, fullNameIsValid], validateFullName] = React.useState(["", false]);
  const [[email, emailIsValid], validateEmail] = React.useState(["", false]);
  const [[password, passwordIsValid], validatePassword] = React.useState(["", false]);
  const submitForm = () => {
    setShowValidationMessage(true);

    if (fullNameIsValid && emailIsValid && passwordIsValid) {
      // sendFieldValues();
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
            value={fullName}
            onValueChange={validateFullName}
            validationRules={nameValidationRules}
            showValidationMessage={showValidationMessage}
          />,
          <TextField
            id="email"
            label="Adresa de email"
            value={email}
            inputType="email"
            onValueChange={validateEmail}
            validationRules={emailValidationRules}
            showValidationMessage={showValidationMessage}
          />,
          <PasswordField
            id="password"
            label="Parola"
            value={password}
            onValueChange={validatePassword}
            validationRules={passwordValidationRules}
            showValidationMessage={showValidationMessage}
          />,
        ]}
        actionButtons={[<SubmitButton label="Înregistrează" onClick={submitForm} />]}
      />
    </PageLayout>
  );
};

const nameValidationRules: FormValidation.ValidationRules = {
  "Can’t be empty": value => !value,
  "Too long": value => value.length > 10,
};

const emailValidationRules: FormValidation.ValidationRules = {
  "Can’t be empty": value => !value,
};

const passwordValidationRules: FormValidation.ValidationRules = {
  "Can’t be empty": value => !value,
};
