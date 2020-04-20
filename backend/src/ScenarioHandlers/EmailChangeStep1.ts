import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {UserSession} from "shared/src/Model/UserSession";

type Scenario = ScenarioRegistry["EmailChangeStep1"];

export async function EmailChangeStep1(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  console.log({input, session});

  return {
    kind: "UnexpectedError",
    error: "Not implemented yet"
  }
}
