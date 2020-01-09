import assert from "assert";
import {Result} from "./Db";
import {RegisterUser} from "./Actions/RegisterUser";
import {TestAction} from "./Actions/TestAction";
import {ActionName} from "../../../shared/src/ActionRegistry";

const ActionRegistry: Record<ActionName, HandlerFunction> = {
  RegisterUser,
  TestAction,
};

export function handleActionRequest(actionName: string, actionParams: any): Promise<Result> {
  const actionHandler = ActionRegistry[actionName as ActionName];

  assert(!!actionHandler, `Could not find action handler for: ${actionName}`);

  return actionHandler(actionParams);
}

type HandlerFunction = (params: any) => any;
