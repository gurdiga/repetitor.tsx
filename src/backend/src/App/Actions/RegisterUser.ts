import {ActionDefinition} from "App/ActionRegistry";

export const RegisterUser: ActionDefinition = {
  assertValidParams: params => {
    throw new Error("Param validation for RegisterUser is not yet implemented");
  },
  execute: () => Promise.resolve({rows: ["TODO"]}),
};
