import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {makeProfileUpdateRequestFromInput} from "shared/src/Model/Profile";
import {updateProfile} from "backend/src/Persistence/TutorPersistence";

type Scenario = ScenarioRegistry["ProfileUpdate"];

export async function ProfileUpdate(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  if (!session.userId) {
    return {kind: "NotAuthenticatedError"};
  }

  const profileUpdateRequestMakingResult = makeProfileUpdateRequestFromInput(input);

  if (profileUpdateRequestMakingResult.kind !== "ProfileUpdateRequest") {
    return profileUpdateRequestMakingResult;
  }

  return updateProfile(session.userId, profileUpdateRequestMakingResult.fullName);
}
