import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {UserSession} from "shared/src/Model/UserSession";

type Scenario = ScenarioRegistry["Logout"];

export async function Logout(_input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  session.userId = undefined;
  session.email = undefined;

  return {
    kind: "LogoutSuccess",
  };
}
