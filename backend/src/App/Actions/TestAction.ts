import {runQuery} from "App/DB";
import {ActionDefinition} from "App/ActionDefinition";

export const TestAction: ActionDefinition = {
  assertValidParams: params => null,
  execute: () =>
    runQuery({
      sql: "SELECT 1 + 1",
      params: [],
    }),
};
