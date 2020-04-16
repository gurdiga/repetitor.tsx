import React = require("react");
import {ProfileForm} from "frontend/pages/profil/src/ProfileForm";
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {Spinner} from "frontend/shared/src/Components/Spinner";
import {
  EmptyScenarioInput,
  placeholderServerRequest,
  RequestState,
  runScenario,
  ServerRequest,
} from "frontend/shared/src/ScenarioRunner";
import {Link, ProfileLoaded} from "shared/src/Model/Profile";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";
import {emptyFieldValue} from "shared/src/Utils/Validation";

export function AuthenticatedState() {
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);
  const [fullName, updateFullName] = React.useState(emptyFieldValue);
  const [email, updateEmail] = React.useState(emptyFieldValue);
  const [photo, updatePhoto] = React.useState<Link | undefined>(undefined);

  if (serverRequest.requestState === RequestState.NotYetSent) {
    loadProfileInfo();

    return <Spinner />;
  } else if (serverRequest.requestState === RequestState.Sent) {
    return <Spinner />;
  } else if (serverRequest.requestState === RequestState.ReceivedError) {
    return <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>;
  } else {
    return <ProfileForm fullName={fullName.value} email={email.value} photo={photo} />;
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
