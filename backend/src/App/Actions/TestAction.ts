import {runQuery} from "../Db";
import {TestActionParams, TestActionResponse} from "shared/Scenarios/TestAction";

export async function TestAction(_params: TestActionParams): Promise<TestActionResponse> {
  const result = await runQuery({
    sql: "SELECT 1 + 1 AS sum",
    params: [],
  });

  const {sum} = result.rows[0];

  return {rows: [{sum}]};
}
