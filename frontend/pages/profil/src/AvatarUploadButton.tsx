import React = require("react");
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {MAX_UPLOADED_FILE_SIZE} from "shared/src/Model/FileUpload";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";

interface Props {
  onUploaded: (url: URL) => void;
}

export function AvatarUploadButton(props: Props) {
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <div>
      <input type="file" onChange={maybeUploadFile} />

      {serverRequest.requestState === RequestState.ReceivedError && (
        <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>
      )}
    </div>
  );

  async function maybeUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const {files} = event.target;

    if (!files || files.length === 0) {
      return;
    }

    const response = await runScenario("AvatarUpload", {upload: files});

    let requestState: RequestState;
    let statusText: string;

    switch (response.kind) {
      case "AvatarUrl":
        [requestState, statusText] = [RequestState.ReceivedSuccess, ""];
        props.onUploaded(response.url);
        break;
      case "NotAuthenticatedError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          "Eroare: probabil a expirat sesiunea din cauza inactivității.",
        ];
        break;
      case "BadFileTypeError":
        [requestState, statusText] = [RequestState.ReceivedError, `Poza trebuie să fie în format JPEG`];
        break;
      case "FileTooLargeError":
        [requestState, statusText] = [
          RequestState.ReceivedError,
          `Poza trebuie să aibă mai puțin de ${MAX_UPLOADED_FILE_SIZE / 1_048_576}MB`,
        ];
        break;
      case "UploadTempFileMissingErrorr":
      case "UnacceptableUploadError":
      case "CloudUploadError":
        [requestState, statusText] = [RequestState.ReceivedError, `Eroare: ${response.kind}`];
        break;
      case "TransportError":
      case "ServerError":
        [requestState, statusText] = [RequestState.ReceivedError, response.error];
        break;
      case "DbError":
        [requestState, statusText] = [RequestState.ReceivedError, DbErrorMessages[response.errorCode]];
        break;
      case "UnexpectedError":
        [requestState, statusText] = [RequestState.ReceivedError, response.error];
        break;
      default:
        assertNever(response);
    }

    setServerRequest({requestState, statusText});
  }
}
