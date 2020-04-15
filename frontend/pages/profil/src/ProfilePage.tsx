import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {Avatar} from "frontend/shared/src/Components/Avatar";
import {Form} from "frontend/shared/src/Components/Form";
import {DisplayOnlyField} from "frontend/shared/src/Components/FormFields/DisplayOnlyField";
import {DisplayOnlyPasswordField} from "frontend/shared/src/Components/FormFields/DisplayOnlyPasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {NeedsAuthentication} from "frontend/shared/src/Components/NeedsAuthentication";
import {ResetPasswordLink} from "frontend/shared/src/Components/ResetPasswordLink";
import {SecondaryButton} from "frontend/shared/src/Components/SecondaryButton";
import {Spinner} from "frontend/shared/src/Components/Spinner";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {
  EmptyScenarioInput,
  placeholderServerRequest,
  RequestState,
  runScenario,
  ServerRequest,
} from "frontend/shared/src/ScenarioRunner";
import * as React from "react";
import {FullNameErrorMessages, FullNameValidationRules} from "shared/src/Model/Account";
import {Link, ProfileLoaded} from "shared/src/Model/Profile";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {PageProps} from "shared/src/Utils/PageProps";
import {emptyFieldValue, ValidatedValue} from "shared/src/Utils/Validation";

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
  const [photo, updatePhoto] = React.useState<Link | undefined>(undefined);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  if (serverRequest.requestState === RequestState.NotYetSent) {
    loadProfileInfo();

    return <Spinner />;
  }

  if (serverRequest.requestState === RequestState.Sent) {
    return <Spinner />;
  } else if (serverRequest.requestState === RequestState.ReceivedError) {
    return <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>;
  } else {
    // serverRequest.requestState === RequestState.ReceivedSuccess
    return (
      <>
        <Avatar url={photo} />
        <Form
          fields={[
            <TextField
              autoFocus
              id="fullName"
              label="Nume deplin"
              value={fullName.value}
              onValueChange={updateFullName}
              validationRules={FullNameValidationRules}
              showValidationMessage={shouldShowValidationMessage}
              validationMessages={FullNameErrorMessages}
            />,
            <DisplayOnlyField
              id="email"
              label="Adresa de email"
              value={email.value}
              additionalControls={<SecondaryButton label="Schimbă" onClick={() => new Promise(() => alert("click"))} />}
            />,
            <DisplayOnlyPasswordField id="password" label="Parola" additionalControls={<ResetPasswordLink />} />,
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
  }

  async function maybeSubmitForm(fields: Record<"fullName", ValidatedValue<string>>): Promise<void> {
    const anyInvalidField = Object.values(fields).some((f) => !f.isValid);

    if (anyInvalidField) {
      return;
    }

    const response = await runScenario("ProfileUpdate", {
      fullName: fields.fullName.value,
    });

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "ProfileUpdated":
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Profilul a fost actualizat."];
        break;
      case "FullNameError":
        [requestState, statusText] = [RequestState.ReceivedError, FullNameErrorMessages[response.errorCode]];
        break;
      case "NotAuthenticatedError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          "Pentru a vă vedea profilul trebuie să fiți autentificat.",
        ];
        break;
      case "ProfileNotFoundError":
        [requestState, statusText] = [RequestState.ReceivedError, "Nu am găsit profilul."];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "ServerError":
      case "TransportError":
        [requestState, statusText] = [RequestState.ReceivedError, response.error];
        break;
      default:
        assertNever(response);
    }

    setServerRequest({requestState, statusText});
  }

  async function loadProfileInfo() {
    setServerRequest({
      requestState: RequestState.Sent,
      statusText: "",
    });

    const response = await runScenario("ProfileLoad", EmptyScenarioInput);
    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "ProfileLoaded":
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Profile loaded"];
        receiveProfileInfo(response);
        break;
      case "NotAuthenticatedError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          "Pentru a vă vedea profilul trebuie să vă autentificați",
        ];
        break;
      case "ProfileNotFoundError":
        [requestState, statusText] = [RequestState.ReceivedError, "Nu am găsit profilul"];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
      case "TransportError":
      case "ServerError":
        [requestState, statusText] = [RequestState.ReceivedError, `Eroare: ${response.error}`];
        break;
      default:
        assertNever(response);
    }

    setServerRequest({requestState, statusText});
  }

  function receiveProfileInfo(profileInfo: ProfileLoaded): void {
    updateFullName({value: profileInfo.fullName, isValid: true});
    updateEmail({value: profileInfo.email, isValid: true});
    updatePhoto(profileInfo.photo);
  }
}
