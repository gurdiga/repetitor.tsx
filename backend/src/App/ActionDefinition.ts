import {Data} from "App/Backend";

export interface ActionRequest {
  actionName: string;
  actionParams: {[name: string]: string[]};
}

export interface ActionDefinition {
  assertValidParams: (params: ActionRequest["actionParams"]) => void; // Throws unless params are valid
  execute: () => Promise<Data>;
}
