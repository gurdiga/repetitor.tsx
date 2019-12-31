import * as assert from "assert";

import {Result} from "App/DB";
import {TestAction} from "App/Actions/TestAction";
import {RegisterUser} from "App/Actions/RegisterUser";

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
