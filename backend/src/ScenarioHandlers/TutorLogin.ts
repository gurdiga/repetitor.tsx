import {ScenarioRegistry} from "shared/ScenarioRegistry";

type Scenario = ScenarioRegistry["TutorLogin"];

export async function TutorLogin(_dto: Scenario["DTO"]): Promise<Scenario["Result"]> {
  return {
    kind: "UnexpectedError",
    errorCode: "Not yet implemented",
  };
}
