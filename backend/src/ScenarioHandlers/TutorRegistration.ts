import {getStorablePassword} from "../Utils/StringUtils";
import {createTutor} from "../Persistence/TutorPersistence";
import {makeTutorFromRegistrationFormDTO} from "shared/Model/Tutor";
import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {UserSession} from "shared/Model/UserSession";

type Scenario = ScenarioRegistry["TutorRegistration"];

export async function TutorRegistration(dto: Scenario["DTO"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeTutorFromRegistrationFormDTO(dto);

  if (result.kind !== "User") {
    return result;
  }

  const {fullName, email, password} = result;
  const {salt, passwordHash} = getStorablePassword(password);

  const createTutorResult = await createTutor(fullName, email, passwordHash, salt);

  if (createTutorResult.kind === "TutorCreationSuccess") {
    session.userId = createTutorResult.id;
  }

  return createTutorResult;
}
