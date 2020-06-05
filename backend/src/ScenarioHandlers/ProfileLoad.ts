import {getStoredFileUrl} from "backend/src/FileStorage";
import {loadProfile} from "backend/src/Persistence/AccountPersistence";
import {ClientSideProfile, ProfileLoaded} from "shared/src/Model/Profile";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

type Scenario = ScenarioRegistry["ProfileLoad"];

export async function ProfileLoad(_input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  if (!session.userId) {
    return {kind: "NotAuthenticatedError"};
  }

  const loadProfileResult = await loadProfile(session.userId);

  if (loadProfileResult.kind !== "ProfileLoaded") {
    return loadProfileResult;
  }

  return makeClientSideProfileFromLoadedProfile(loadProfileResult);
}

function makeClientSideProfileFromLoadedProfile(profile: ProfileLoaded): ClientSideProfile {
  const {avatarFilename} = profile;
  const avatarUrl = avatarFilename === null ? null : getStoredFileUrl(avatarFilename);

  return {...profile, kind: "ClientSideProfile", avatarUrl};
}
