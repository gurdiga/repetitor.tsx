import * as assert from "assert";
import {ActionRegistry} from "App/ActionRegistry";
import {Data} from "App/DB";

export function handleActionRequest(actionName: string, actionParams: any): Promise<Data> {
  const actionHandler = ActionRegistry[actionName];

  assert(!!actionHandler, `Could not find action handler for: ${actionName}`);

  return actionHandler(actionParams);
}
