import React = require("react");
import {Avatar} from "frontend/shared/src/Components/Avatar";
import {Form} from "frontend/shared/src/Components/Form";
import {DisplayOnlyField} from "frontend/shared/src/Components/FormFields/DisplayOnlyField";
import {DisplayOnlyPasswordField} from "frontend/shared/src/Components/FormFields/DisplayOnlyPasswordField";
import {TextField} from "frontend/shared/src/Components/FormFields/TextField";
import {ResetPasswordLink} from "frontend/shared/src/Components/ResetPasswordLink";
import {SecondaryButton} from "frontend/shared/src/Components/SecondaryButton";
import {SubmitButton} from "frontend/shared/src/Components/SubmitButton";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {FullNameErrorMessages, FullNameValidationRules} from "shared/src/Model/Account";
import {Link} from "shared/src/Model/Profile";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {ValidatedValue} from "shared/src/Utils/Validation";
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";

interface Props {
  fullName: string;
  email: string;
  photo: Link | undefined;
}

export function ProfileForm(props: Props) {
  const [fullName, updateFullName] = React.useState({value: props.fullName, isValid: true});

  const [shouldShowValidationMessage, toggleValidationMessage] = React.useState(false);
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <>
      <Avatar url={props.photo} />
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
      {serverRequest.requestState === RequestState.ReceivedError && (
        <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>
      )}
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
}
