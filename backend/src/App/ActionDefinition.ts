import {Data} from "App/Backend";

export interface ActionParams {
  [paramName: string]: string[] | string;
}

export interface ActionRequest {
  actionName: string;
  actionParams: ActionParams;
}

export interface ActionDefinition<P extends ActionParams> {
  assertValidParams: (params: P) => void;
  execute: (params: P) => Promise<Data>;
}
