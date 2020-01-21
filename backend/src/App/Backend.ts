import {RegisterUser} from "./Actions/RegisterUser";
import {TestAction} from "./Actions/TestAction";

const actionList = [RegisterUser, TestAction];

export async function handleActionRequest(actionName?: string, actionParams: any = {}): Promise<any> {
  if (!actionName) {
    throw new Error(`The "actionName" param is required`);
  }

  const actionHandler = actionList.find(f => f.name === actionName);

  if (!actionHandler) {
    throw new Error(`Could not find action handler for: "${actionName}"`);
  }

  return await actionHandler(actionParams);
}
