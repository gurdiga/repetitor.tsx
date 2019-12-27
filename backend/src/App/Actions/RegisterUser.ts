import {ActionDefinition} from "App/ActionDefinition";

export const RegisterUser: ActionDefinition = {
  assertValidParams: params => {
    throw new Error("Param validation for RegisterUser is not yet implemented");
  },
  execute: params => Promise.resolve({rows: ["TODO"]}),
};
