import {PageLayout} from "frontend/shared/src/PageLayout";
import * as React from "react";
import {PageProps} from "shared/src/Utils/PageProps";
import {Form} from "frontend/shared/src/Components/Form";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {emptyFieldValue} from "shared/src/Utils/Validation";
import {TutorFullNameValidationRules, FullNameErrorMessages} from "shared/src/Model/Tutor";
import {EmailValidationRules, EmailErrorMessages} from "shared/src/Model/Email";
import {DisplayOnlyField} from "frontend/shared/src/Components/FormFields/DisplayOnlyField";

export function ProfilePage(props: PageProps) {
  const {isAuthenticated} = props;

  return (
    <PageLayout {...{title: "Profil", isAuthenticated}}>
      {isAuthenticated ? renderProfileForm() : <NeedsAuthentication />}
    </PageLayout>
  );
}

function renderProfileForm() {
  const [fullName, updateFullName] = React.useState(emptyFieldValue);
  const [email, updateEmail] = React.useState(emptyFieldValue);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);

  // TODO: Load profile info.

  return (
    <>
      <pre>TODO: Add avatar.</pre>
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
            validationMessages={FullNameErrorMessages}
          />,
          <DisplayOnlyField
            id="email"
            label="Adresa de email"
            value={email.value}
            additionalControls={<button>Change the email address carefully.</button>}
          />,
        ]}
        actionButtons={[]}
      />
    </>
  );
}

// TODO: Extract to /frontend/shared and use it in other similar circumstances.
function NeedsAuthentication() {
  // redirect to the login page in 2 seconds.
  return <div>Redirect to login page please.</div>;
}
