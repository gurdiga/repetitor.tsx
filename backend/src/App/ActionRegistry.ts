import {Data} from "App/Backend";
import {TestAction} from "App/Actions/TestAction";
import {RegisterUser} from "App/Actions/RegisterUser";

export const ActionRegistry: ActionRegistry = {
  RegisterUser,
  TestAction,
};

interface ActionRegistry {
  [actionKey: string]: ActionDefinition;
}

export interface ActionRequest {
  actionName: string;
  actionParams: {[name: string]: string[]};
}

export interface ActionDefinition {
  assertValidParams: (params: ActionRequest["actionParams"]) => void; // Throws unless params are valid
  execute: () => Promise<Data>;
}
