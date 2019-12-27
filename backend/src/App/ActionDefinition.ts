import {Data} from "App/Backend";

interface ActionParams {
  [name: string]: string[];
}

export interface ActionRequest {
  actionName: string;
  actionParams: ActionParams;
}

export interface ActionDefinition {
  assertValidParams: (params: ActionParams) => void; // Throws unless params are valid
  execute: (params: ActionParams) => Promise<Data>;
}
