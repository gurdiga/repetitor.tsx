import * as React from "react";

import {PageLayout} from "Common/PageLayout";
import {Form} from "Common/Components/Form";
import {TextField} from "Common/Components/FormFields/TextField";
import {PasswordField} from "Common/Components/FormFields/PasswordField";

export const RegistrationPage = () => (
  <PageLayout title="Înregistrare tutore">
    <Form
      fields={[
        <TextField id="fullName" label="Nume deplin" autoFocus />,
        <TextField id="email" label="Adresa de email" inputType="email" />,
        <PasswordField id="password" label="Parola" />,
      ]}
    />
  </PageLayout>
);
