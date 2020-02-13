import {getStorablePassword} from "../Utils/StringUtils";
import {createTutor} from "../Persistence/TutorPersistence";
import {makeTutorFromRegistrationFormDTO} from "shared/Model/Tutor";
import {ScenarioRegistry} from "shared/ScenarioRegistry";

type Scenario = ScenarioRegistry["TutorRegistration"];

export async function TutorRegistration(dto: Scenario["DTO"]): Promise<Scenario["Result"]> {
  const result = makeTutorFromRegistrationFormDTO(dto);

  if (result.kind !== "User") {
    return result;
  }

  const {fullName, email, password} = result;
  const {salt, passwordHash} = getStorablePassword(password);

  return createTutor(fullName, email, passwordHash, salt);
}
