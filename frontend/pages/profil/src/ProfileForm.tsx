import React = require("react");
import {AvatarUploadButton} from "frontend/pages/profil/src/AvatarUploadButton";
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {Avatar} from "frontend/shared/src/Components/Avatar";
import {Form} from "frontend/shared/src/Components/Form";
import {DisplayOnlyField} from "frontend/shared/src/Components/FormFields/DisplayOnlyField";
import {DisplayOnlyPasswordField} from "frontend/shared/src/Components/FormFields/DisplayOnlyPasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {ResetPasswordLink} from "frontend/shared/src/Components/ResetPasswordLink";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {FullNameErrorMessages, FullNameValidationRules} from "shared/src/Model/Account";
import {Link} from "shared/src/Model/Profile";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {PagePath} from "shared/src/Utils/PagePath";
import {ValidatedValue} from "shared/src/Utils/Validation";

interface Props {
  fullName: string;
  email: string;
  photo: Link | undefined;
}

export function ProfileForm(props: Props) {
  const [fullName, updateFullName] = React.useState({value: props.fullName, isValid: true});
  const [photoUrl, setPhotoUrl] = React.useState(props.photo);

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <>
      <Avatar url={photoUrl} />
      <AvatarUploadButton onUploaded={(url) => setPhotoUrl({kind: "Link", value: url})} />
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
            value={props.email}
            additionalControls={<a href={PagePath.EmailChange}>Schimbare email</a>}
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
      {statusMessage(serverRequest.requestState)}
    </>
  );

  function statusMessage(requestState: RequestState) {
    switch (requestState) {
      case RequestState.ReceivedSuccess:
        return <AlertMessage type="success">{serverRequest.statusText}</AlertMessage>;
      case RequestState.ReceivedError:
        return <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>;
      default:
        return undefined;
    }
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
        [requestState, statusText] = [RequestState.ReceivedSuccess, "Profilul a fost actualizat"];
        break;
      case "FullNameError":
        [requestState, statusText] = [RequestState.ReceivedError, FullNameErrorMessages[response.errorCode]];
        break;
      case "NotAuthenticatedError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          "Pentru a vă vedea profilul trebuie să fiți autentificat",
        ];
        break;
      case "ProfileNotFoundError":
        [requestState, statusText] = [RequestState.ReceivedError, "Nu am găsit profilul"];
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
}
