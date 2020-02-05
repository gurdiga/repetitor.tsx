import {ScenarioName, ScenarioRegistry} from "shared/ScenarioRegistry";

export async function runScenario<SN extends ScenarioName, S extends ScenarioRegistry[SN]>(
  scenarioName: SN,
  dto: S["DTO"]
): Promise<S["Result"] | TransportError> {
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

  try {
    const requestBody = JSON.stringify({
      scenarioName,
      dto,
      _csrf: csrfToken,
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
          error: "Could not parse the respons JSON",
        };
      }
    } else {
      return {
        kind: "TransportError",
        error: `Eroare de transmisiune: ${response.status} ${response.statusText}`,
      };
    }
  } catch (e) {
    return {
      kind: "TransportError",
      error: e.message,
    };
  }
}

export interface ServerResponse {
  responseState: ResponseState;
  responseText: string;
  shouldShow: boolean;
}

export enum ResponseState {
  NotYetSent = "not-yet-sent",
  ReceivedSuccess = "received-success",
  ReceivedError = "received-error",
}

export const placeholderServerResponse: ServerResponse = {
  responseState: ResponseState.NotYetSent,
  responseText: "",
  shouldShow: false,
};

export interface TransportError {
  kind: "TransportError";
  error: string;
}
