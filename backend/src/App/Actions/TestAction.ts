import {runQuery} from "App/DB";
import {ActionDefinition, ActionParams} from "App/ActionDefinition";

interface Params extends ActionParams {}

export const TestAction: ActionDefinition<Params> = {
  assertValidParams: params => null,
  execute: params =>
    runQuery({
      sql: "SELECT 1 + 1",
      params: [],
    }),
};
