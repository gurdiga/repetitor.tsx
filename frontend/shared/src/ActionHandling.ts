import {ActionDirectory, ActionName} from "shared/ActionDirectory";

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
  actionParams: ActionDirectory[A]["Params"]
): Promise<ActionDirectory[A]["Response"]> {
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
