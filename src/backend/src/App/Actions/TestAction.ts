import {ActionDefinition} from "App/ActionRegistry";
import {runQuery} from "App/DB";

export const TestAction: ActionDefinition = {
  assertValidParams: params => null,
  execute: () =>
    runQuery({
      sql: "SELECT 1 + 1",
      params: [],
    }),
};
