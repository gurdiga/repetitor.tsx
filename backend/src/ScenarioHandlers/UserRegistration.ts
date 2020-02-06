import debug from "debug";
import {genRandomString, hashString} from "../Utils/StringUtils";
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
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const {salt, passwordHash} = getStorablePassword(password);

  return createUser(fullName, email, passwordHash, salt);
}

interface StorablePassword {
  salt: string;
  passwordHash: string;
}

function getStorablePassword(password: string): StorablePassword {
  const salt = genRandomString(100);
  const passwordHash = hashString(password, salt);

  return {salt, passwordHash};
}
