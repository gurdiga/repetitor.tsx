import * as assert from "assert";
import {ActionRequest, ActionDefinition} from "App/ActionDefinition";
import {ActionRegistry} from "App/ActionRegistry";
import {Data} from "App/DB";

export function handleActionRequest(actionRequest: ActionRequest): Promise<Data> {
  const action = getActionForRequest(actionRequest);

  action.assertValidParams(actionRequest.actionParams);

  return action.execute(actionRequest.actionParams);
}

function getActionForRequest({actionName}: ActionRequest): ActionDefinition<any> {
  const action = ActionRegistry[actionName];

  assert(!!action, `Could not find action for request: ${actionName}`);

  return action;
}
