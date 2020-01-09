import {RegisterUser} from "./Actions/RegisterUser";
import {TestAction} from "./Actions/TestAction";

const actionList = [RegisterUser, TestAction];

export async function handleActionRequest(actionName: string, actionParams: any): Promise<any> {
  if (!actionName) {
    throw new Error(`The "actionName" param is required`);
  }

  const actionHandler = actionList.find(f => f.name === actionName);

  if (!actionHandler) {
    throw new Error(`Could not find action handler for: "${actionName}"`);
  }

  const result = await actionHandler(actionParams);

  if ("error" in result) {
    // I don’t throw from action handlers because I want to typecheck possible
    // failure cases so that I can properly handle each of them on the frontend.
    throw new Error(result.error);
  }

  return result;
}
