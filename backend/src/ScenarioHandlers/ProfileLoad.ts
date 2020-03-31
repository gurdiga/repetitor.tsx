import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

type Scenario = ScenarioRegistry["ProfileLoad"];

export async function ProfileLoad(_input: Scenario["Input"]): Promise<Scenario["Result"]> {
  return {
    kind: "UnexpectedError",
    error: "Not implemented yet",
  };
}
