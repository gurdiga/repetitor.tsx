import debug from "debug";
import {genRandomString, hashString, getStorablePassword} from "../Utils/StringUtils";
import {createUser} from "../Persistence/UserPersistence";
import {makeUserFromRegistrationFormDTO} from "shared/Model/User";
import {ScenarioRegistry} from "shared/ScenarioRegistry";

const log = debug("app:UserRegistration");

type Scenario = ScenarioRegistry["UserRegistration"];

export async function UserRegistration(dto: Scenario["DTO"]): Promise<Scenario["Result"]> {
  const result = makeUserFromRegistrationFormDTO(dto);

  log({dto, result});

  if (result.kind !== "User") {
    return result;
  }

  const {fullName, email, password} = result;
  const {salt, passwordHash} = getStorablePassword(password);

  return createUser(fullName, email, passwordHash, salt);
}
