import {runQuery} from "../Utils/Db";
import {TestScenarioParams, TestScenarioResponse} from "shared/Scenarios/TestScenario";

export async function TestScenario(_params: TestScenarioParams): Promise<TestScenarioResponse> {
  const result = await runQuery({
    sql: "SELECT 1 + 1 AS sum",
    params: [],
  });

  const {sum} = result.rows[0];

  return {rows: [{sum}]};
}
