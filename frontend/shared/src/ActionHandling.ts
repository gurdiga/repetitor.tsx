import {ActionName, ActionRegistry} from "shared/ActionRegistry";

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

export interface NetworkError {
  kind: "NetworkError";
  error: string;
}

export async function postAction<A extends ActionName>(
  actionName: A,
  actionParams: ActionRegistry[A]["Params"]
): Promise<ActionRegistry[A]["Response"] | NetworkError> {
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actionName,
        actionParams,
      }),
      redirect: "error",
      cache: "no-store",
    });

    const json = await response.json();

    if (response.status === 200) {
      return json;
    } else {
      return {
        kind: "NetworkError", // TODO: Maybe introduce ServerError?
        error: "error" in json ? json.error : json,
      };
    }
  } catch (e) {
    return {
      kind: "NetworkError",
      error: e.message,
    };
  }
}
