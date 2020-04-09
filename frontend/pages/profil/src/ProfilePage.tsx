import {AlertMessage, getAlertTypeForServerResponseState} from "frontend/shared/src/Components/AlertMessage";
import {Form} from "frontend/shared/src/Components/Form";
import {DisplayOnlyField} from "frontend/shared/src/Components/FormFields/DisplayOnlyField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {Spinner} from "frontend/shared/src/Components/Spinner";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {
  EmptyScenarioInput,
  placeholderServerResponse,
  ResponseState,
  runScenario,
  ServerResponse,
} from "frontend/shared/src/ScenarioRunner";
import * as React from "react";
import {ProfileLoaded} from "shared/src/Model/Profile";
import {FullNameErrorMessages, TutorFullNameValidationRules} from "shared/src/Model/Tutor";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {PageProps} from "shared/src/Utils/PageProps";
import {emptyFieldValue, ValidatedValue} from "shared/src/Utils/Validation";
import {SecondaryButton} from "frontend/shared/src/Components/SecondaryButton";
import {ResetPasswordLink} from "frontend/shared/src/Components/ResetPasswordLink";

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
  const [serverResponse, setServerResponse] = React.useState<ServerResponse>(placeholderServerResponse);
  const [isProfileInfoLoaded, setProfileInfoLoaded] = React.useState(false);

  if (!isProfileInfoLoaded) {
    loadProfileInfo();
    return <Spinner />;
  }

  return (
    <>
      {serverResponse.shouldShow && (
        <AlertMessage type={getAlertTypeForServerResponseState(serverResponse.responseState)}>
          {serverResponse.responseText}
        </AlertMessage>
      )}
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
            additionalControls={<SecondaryButton label="Schimbă" onClick={() => new Promise(() => alert("click"))} />}
          />,
          <DisplayOnlyField
            id="password"
            label="Parola"
            value="****************"
            additionalControls={<ResetPasswordLink />}
          />,
        ]}
        actionButtons={[
          <SubmitButton
            label="Actualizează profil"
            onClick={async () => {
              toggleValidationMessage(true);
              await maybeSubmitForm({fullName});
            }}
          />,
        ]}
      />
    </>
  );

  async function maybeSubmitForm(fields: Record<"fullName", ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some((f) => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("ProfileUpdate", {
      fullName: fields.fullName.value,
    });

    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "ProfileUpdated":
        [responseState, responseText] = [ResponseState.ReceivedSuccess, "Profilul a fost actualizat."];
        break;
      case "FullNameError":
        [responseState, responseText] = [ResponseState.ReceivedError, FullNameErrorMessages[response.errorCode]];
        break;
      case "NotAuthenticatedError":
        [responseState, responseText] = [
          ResponseState.ReceivedError,
          "Pentru a vă vedea profilul trebuie să fiți autentificat.",
        ];
        break;
      case "ProfileNotFoundError":
        [responseState, responseText] = [ResponseState.ReceivedError, "Nu am găsit profilul."];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "ServerError":
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

  async function loadProfileInfo(): Promise<void> {
    const response = await runScenario("ProfileLoad", EmptyScenarioInput);

    let responseState: ResponseState;
    let responseText: string;

    switch (response.kind) {
      case "ProfileLoaded":
        [responseState, responseText] = [ResponseState.ReceivedSuccess, "Profile loaded."];
        receiveProfileInfo(response);
        break;
      case "NotAuthenticatedError":
        [responseState, responseText] = [
          ResponseState.ReceivedError,
          "Pentru a vă vedea profilul trebuie să fiți autentificat.",
        ];
        break;
      case "ProfileNotFoundError":
        [responseState, responseText] = [ResponseState.ReceivedError, "Nu am găsit profilul."];
        break;
      case "DbError":
        [responseState, responseText] = [ResponseState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "TransportError":
      case "ServerError":
        [responseState, responseText] = [ResponseState.ReceivedError, `Eroare: ${response.error}`];
        break;
      default:
        assertNever(response);
    }

    setServerResponse({
      responseState,
      responseText,
      shouldShow: responseState !== ResponseState.ReceivedSuccess,
    });
  }

  function receiveProfileInfo(profileInfo: ProfileLoaded): void {
    updateFullName({value: profileInfo.fullName, isValid: true});
    updateEmail({value: profileInfo.email, isValid: true});
    setProfileInfoLoaded(true);
  }
}

// TODO: Extract to /frontend/shared and use it in other similar circumstances.
function NeedsAuthentication() {
  // redirect to the login page in 2 seconds.
  return <div>Redirect to login page please.</div>;
}
