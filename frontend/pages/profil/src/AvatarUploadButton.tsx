import React = require("react");
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {placeholderServerRequest, RequestState, runScenario, ServerRequest} from "frontend/shared/src/ScenarioRunner";
import {EXPECTED_AVATAR_IMAGE_TYPE, makeFileListFromInputElement, MAX_AVATAR_SIZE} from "shared/src/Model/AvatarUpload";
import {MAX_UPLOADED_FILE_SIZE} from "shared/src/Model/FileUpload";
import {DbErrorMessages} from "shared/src/Model/Utils";
import {assertNever} from "shared/src/Utils/Language";

interface Props {
  onUploaded: (url: string) => void;
}

export function AvatarUploadButton(props: Props) {
  const [validationError, setValidationError] = React.useState<string | undefined>();
  const [serverRequest, setServerRequest] = React.useState<ServerRequest>(placeholderServerRequest);

  return (
    <div>
      <input type="file" onChange={maybeUploadFile} />

      {validationError && <AlertMessage type="error">{validationError}</AlertMessage>}

      {serverRequest.requestState === RequestState.ReceivedError && (
        <AlertMessage type="error">{serverRequest.statusText}</AlertMessage>
      )}
    </div>
  );

  async function maybeUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const result = makeFileListFromInputElement(event.target);

    if (!(result instanceof FileList)) {
      switch (result.kind) {
        case "BadFileTypeError":
          setValidationError(`Formatul fotografiei nu corespunde: trebuie ${EXPECTED_AVATAR_IMAGE_TYPE}`);
          break;
        case "TooManyFilesError":
          setValidationError(`Selectați o singură fotografie`);
          break;
        case "FileTooLargeError":
          setValidationError(`Poza trebuie să aibă mai puțin de ${MAX_AVATAR_SIZE / 1_048_576}MB`);
          break;
        default:
          assertNever(result);
      }

      return;
    } else {
      setValidationError(undefined);
    }

    const response = await runScenario("AvatarUpload", {upload: result});

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
      case "UploadMissingError":
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
