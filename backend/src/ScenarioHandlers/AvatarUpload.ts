import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

type Scenario = ScenarioRegistry["AvatarUpload"];

export async function AvatarUpload(_input: Scenario["Input"], _session: UserSession): Promise<Scenario["Result"]> {
  return {
    kind: "UnexpectedError",
    error: "Not yet implemented",
  };
}
