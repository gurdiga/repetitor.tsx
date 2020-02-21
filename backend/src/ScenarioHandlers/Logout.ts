import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {UserSession} from "shared/Model/UserSession";

type Scenario = ScenarioRegistry["Logout"];

export async function Logout(_input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  session.userId = undefined;

  return {
    kind: "LogoutSuccess",
  };
}
