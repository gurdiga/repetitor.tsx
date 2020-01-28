import {runQuery} from "Utils/Db";
import {ScenarioRegistry} from "shared/ScenarioRegistry";

type Scenario = ScenarioRegistry["TestScenario"];

export async function TestScenario(_dto: Scenario["DTO"]): Promise<Scenario["Result"]> {
  const result = await runQuery({
    sql: "SELECT 1 + 1 AS sum",
    params: [],
  });

  const {sum} = result.rows[0];

  return {rows: [{sum}]};
}
