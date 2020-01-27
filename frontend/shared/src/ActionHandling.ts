import {ScenarioName, ScenarioRegistry} from "shared/ScenarioRegistry";

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

export interface TransportError {
  kind: "TransportError";
  error: string;
}

export async function runScenario<SN extends ScenarioName, S extends ScenarioRegistry[SN]>(
  scenarioName: SN,
  dto: S["DTO"]
): Promise<S["Response"] | TransportError> {
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scenarioName,
        dto,
      }),
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
        error: response.statusText,
      };
    }
  } catch (e) {
    return {
      kind: "TransportError",
      error: e.message,
    };
  }
}
