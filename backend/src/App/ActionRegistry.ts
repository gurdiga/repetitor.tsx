import {TestAction} from "App/Actions/TestAction";
import {RegisterUser} from "App/Actions/RegisterUser";
import {ActionDefinition} from "App/ActionDefinition";

export const ActionRegistry: {[actionKey: string]: ActionDefinition<any>} = {
  RegisterUser,
  TestAction,
};
