import {ActionRegistry, ActionName} from "shared/ActionRegistry";

export interface ServerResponse {
  responseState: ResponseState;
  responseText: string;
  shouldShow: boolean;
}

export enum ResponseState {
  NotAskedYet = "not-asked-yet",
  ReceivedSuccess = "received-success",
  ReceivedError = "received-error",
}

export async function postAction<A extends ActionName>(
  actionName: A,
  actionParams: ActionRegistry[A]["Params"]
): Promise<ActionRegistry[A]["Response"]> {
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
}
