import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {UserSession} from "shared/src/Model/UserSession";
import {loadProfile} from "backend/src/Persistence/AccountPersistence";

type Scenario = ScenarioRegistry["ProfileLoad"];

export async function ProfileLoad(_input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  if (!session.userId) {
    return {kind: "NotAuthenticatedError"};
  }

  return loadProfile(session.userId);
}
