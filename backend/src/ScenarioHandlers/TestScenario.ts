import {runQuery, RowSet} from "Utils/Db";
import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {logError} from "Utils/Logging";

type Scenario = ScenarioRegistry["TestScenario"];

export async function TestScenario(_input: Scenario["Input"]): Promise<Scenario["Result"]> {
  try {
    const result = (await runQuery({
      sql: "SELECT 1 + 1 AS sum",
      params: [],
    })) as RowSet;

    try {
      const {sum} = result.rows[0];

      return {rows: [{sum}]};
    } catch (e) {
      logError(e);
      return {kind: "UnexpectedError", error: e.message};
    }
  } catch (e) {
    logError(e);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}
