import {ApplicationError} from "App/ApplicationError";
import {runQuery} from "App/DB";
import {Data} from "App/Backend";

export interface ActionRequest {
  actionName: string;
  actionParams: {[name: string]: string[]};
}

export interface ActionDefinition {
  assertValidParams: (params: ActionRequest["actionParams"]) => void; // Throws unless params are valid
  execute: () => Promise<Data>;
}

export const ActionRegistry: {[actionKey: string]: ActionDefinition} = {
  RegisterUser: {
    assertValidParams: params => {
      throw new ApplicationError("Param validation for RegisterUser is not yet implemented");
    },
    execute: () => Promise.resolve({rows: ["TODO"]}),
  },
  TestAction: {
    assertValidParams: params => null,
    execute: () =>
      runQuery({
        sql: "SELECT 1 + 1",
        params: [],
      }),
  },
};
