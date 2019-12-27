import * as assert from "assert";
import {ActionRegistry, ActionRequest, ActionDefinition} from "App/ActionRegistry";

export interface Data {
  rows: any[];
}

export function handleActionRequest(actionRequest: ActionRequest): Promise<Data> {
  const action = getActionForRequest(actionRequest);

  action.assertValidParams(actionRequest.actionParams);

  return action.execute();
}

function getActionForRequest({actionName}: ActionRequest): ActionDefinition {
  const action = ActionRegistry[actionName];

  assert(!!action, `Could not find action for request: ${actionName}`);

  return action;
}
