import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {UserSession, clearUserSession} from "shared/src/Model/UserSession";

type Scenario = ScenarioRegistry["Logout"];

export async function Logout(_input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  clearUserSession(session);

  return {
    kind: "LogoutSuccess",
  };
}
