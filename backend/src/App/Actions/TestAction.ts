import {runQuery} from "../Db";
import {ActionDirectory} from "../../../../shared/src/ActionDirectory";

type Params = ActionDirectory["TestAction"]["Params"];
type Response = ActionDirectory["TestAction"]["Response"];

export async function TestAction(_params: Params): Promise<Response> {
  const result = await runQuery({
    sql: "SELECT 1 + 1 AS sum",
    params: [],
  });

  const {sum} = result.rows[0];

  return {rows: [{sum}]};
}
