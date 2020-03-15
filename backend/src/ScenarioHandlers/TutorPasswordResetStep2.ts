import {ScenarioRegistry} from "shared/ScenarioRegistry";

type Scenario = ScenarioRegistry["TutorPasswordResetStep2"];

export async function TutorPasswordResetStep2(_input: Scenario["Input"]): Promise<Scenario["Result"]> {
  return {
    kind: "TutorPasswordResetSuccess",
  };
}
