import {UPLOADED_FILES_FORM_FIELD_NAME, UploadScenario} from "shared/src/Model/FileUpload";
import {ScenarioName, ScenarioRegistry} from "shared/src/ScenarioRegistry";

const FETCH_DEFAULTS: RequestInit = {
  method: "POST",
  redirect: "error",
  cache: "no-store",
};

export async function runScenario<SN extends ScenarioName, S extends ScenarioRegistry[SN]>(
  scenarioName: SN,
  scenarioInput: S["Input"]
): Promise<S["Result"] | TransportError | ServerError> {
  const getCsrfTokenResult = getCsrfToken();

  if (getCsrfTokenResult.kind !== "CsrfTokenResultSuccess") {
    return getCsrfTokenResult;
  }

  try {
    const {csrfToken} = getCsrfTokenResult;
    const request = createRquest<S["Input"]>(scenarioName, scenarioInput, csrfToken);
    const response = await fetch("/", request);

    if (response.status === 200) {
      try {
        return await response.json();
      } catch (e) {
        return {
          kind: "TransportError",
          error: "Nu înțeleg răspunsul de la server (parsare JSON).",
        };
      }
    } else {
      try {
        return {
          kind: "ServerError",
          error: `Eroare neprevăzută de aplicație (${(await response.json()).error})`,
        };
      } catch (e) {
        return {
          kind: "ServerError",
          error: `Eroare neprevăzută de aplicație (${response.status} ${response.statusText})`,
        };
      }
    }
  } catch (e) {
    return {
      kind: "TransportError",
      error: e.message,
    };
  }
}

function createRquest<SI>(scenarioName: string, scenarioInput: SI, csrfToken: string): RequestInit {
  if ("upload" in scenarioInput) {
    return createUploadRequest(scenarioName, scenarioInput, csrfToken);
  } else {
    return createJsonRquest(scenarioName, scenarioInput, csrfToken);
  }
}

function createUploadRequest<SI>(scenarioName: string, scenarioInput: SI, csrfToken: string): RequestInit {
  const fileList = getFileList<SI>(scenarioInput);
  const userFiles = Array.from(fileList);
  const uploadForm = new FormData();

  userFiles.forEach((file) => {
    uploadForm.append(UPLOADED_FILES_FORM_FIELD_NAME, file);
  });

  uploadForm.append("scenarioName", scenarioName);
  uploadForm.append("scenarioInput", JSON.stringify(scenarioInput));
  uploadForm.append("_csrf", csrfToken);

  return {...FETCH_DEFAULTS, body: uploadForm};
}

function getFileList<SI>(scenarioInput: SI): FileList {
  const uploadScenario = (scenarioInput as any) as UploadScenario;

  if (!(uploadScenario.upload instanceof FileList)) {
    throw new Error("UploadScenario.upload must be a FileList");
  }

  return uploadScenario.upload;
}

function createJsonRquest<SI>(scenarioName: string, scenarioInput: SI, csrfToken: string): RequestInit {
  return {
    ...FETCH_DEFAULTS,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      scenarioName,
      scenarioInput,
      _csrf: csrfToken,
    }),
  };
}

export const EmptyScenarioInput = {};

export interface ServerRequest {
  requestState: RequestState;
  statusText: string;
}

export enum RequestState {
  NotYetSent = "not-yet-sent",
  Sent = "sent",
  ReceivedSuccess = "received-success",
  ReceivedError = "received-error",
}

export const placeholderServerRequest: ServerRequest = {
  requestState: RequestState.NotYetSent,
  statusText: "",
};

export interface TransportError {
  kind: "TransportError";
  error: string;
}

export interface ServerError {
  kind: "ServerError";
  error: string;
}

interface CsrfTokenResultSuccess {
  kind: "CsrfTokenResultSuccess";
  csrfToken: string;
}

function getCsrfToken(): TransportError | CsrfTokenResultSuccess {
  const csrfTokenMetaTag = document.head.querySelector('meta[name="csrf_token"]');

  if (!csrfTokenMetaTag) {
    return {
      kind: "TransportError",
      error: "Lipsește codul CSRF (meta tag)",
    };
  }

  const csrfToken = csrfTokenMetaTag.getAttribute("content");

  if (!csrfToken) {
    return {
      kind: "TransportError",
      error: "Lipsește codul CSRF",
    };
  }

  return {
    kind: "CsrfTokenResultSuccess",
    csrfToken,
  };
}
