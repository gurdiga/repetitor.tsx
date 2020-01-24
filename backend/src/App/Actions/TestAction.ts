import {ActionRegistry} from "shared/ActionRegistry";
import {runQuery} from "App/Db";

type Params = ActionRegistry["TestAction"]["Params"];
type Response = ActionRegistry["TestAction"]["Response"];

export async function TestAction(_params: Params): Promise<Response> {
  const result = await runQuery({
    sql: "SELECT 1 + 1 AS sum",
    params: [],
  });

  const {sum} = result.rows[0];

  return {rows: [{sum}]};
}
