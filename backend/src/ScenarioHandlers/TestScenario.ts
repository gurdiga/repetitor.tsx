import {RowSet, runQuery} from "backend/src/Db";
import {logError} from "backend/src/ErrorLogging";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

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
