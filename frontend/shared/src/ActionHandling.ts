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

    return await response.json();
  } catch (e) {
    return {
      kind: "NetworkError",
      error: e.message,
    };
  }
}
