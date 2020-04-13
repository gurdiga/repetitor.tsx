import {ScenarioName, ScenarioRegistry} from "shared/src/ScenarioRegistry";

export async function runScenario<SN extends ScenarioName, S extends ScenarioRegistry[SN]>(
  scenarioName: SN,
  scenarioInput: S["Input"]
): Promise<S["Result"] | TransportError | ServerError> {
  const getCsrfTokenResult = getCsrfToken();

  if (getCsrfTokenResult.kind !== "CsrfTokenResultSuccess") {
    return getCsrfTokenResult;
  }

  try {
    const requestBody = JSON.stringify({
      scenarioName,
      scenarioInput,
      _csrf: getCsrfTokenResult.csrfToken,
    });

    const response = await fetch("/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: requestBody,
      redirect: "error",
      cache: "no-store",
    });

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
      return {
        kind: "ServerError",
        error: `Eroare neprevăzută de aplicație (${response.status} ${response.statusText})`,
      };
    }
  } catch (e) {
    return {
      kind: "TransportError",
      error: e.message,
    };
  }
}

export const EmptyScenarioInput = {};

export interface ServerRequest {
  requestState: RequestState;
  statusText: string;
  shouldShow: boolean;
}

export enum RequestState {
  NotYetSent = "not-yet-sent",
  Sent = "sent",
  ReceivedSuccess = "received-success",
  ReceivedError = "received-error",
}

export const placeholderServerResponse: ServerRequest = {
  requestState: RequestState.NotYetSent,
  statusText: "",
  shouldShow: false,
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
