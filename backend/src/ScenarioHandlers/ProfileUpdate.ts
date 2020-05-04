import {updateProfile} from "backend/src/Persistence/AccountPersistence";
import {makeProfileUpdateRequestFromInput} from "shared/src/Model/Profile";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

type Scenario = ScenarioRegistry["ProfileUpdate"];

export async function ProfileUpdate(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  if (!session.userId) {
    return {kind: "NotAuthenticatedError"};
  }

  const result = makeProfileUpdateRequestFromInput(input);

  if (result.kind !== "ProfileUpdateRequest") {
    return result;
  }

  return updateProfile(session.userId, result.fullName);
}
