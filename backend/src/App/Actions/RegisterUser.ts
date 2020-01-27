import debug from "debug";
import {genRandomString, hashString} from "src/App/Utils/StringUtils";
import {createUser} from "src/Persistence/UserPersistence";
import {makeUserFromRegistrationFormDTO} from "shared/Domain/User";
import {UserRegistrationScenarioHandler} from "shared/Scenarios/UserRegistration";

const log = debug("app:RegisterUser");

export const RegisterUser: UserRegistrationScenarioHandler = async params => {
  const result = makeUserFromRegistrationFormDTO(params);

  log({params, result});

  if (result.kind !== "User") {
    return result;
  }

  const {fullName, email, password} = result;
  const {salt, passwordHash} = getStorablePassword(password);

  return createUser(fullName, email, passwordHash, salt);
};

interface StorablePassword {
  salt: string;
  passwordHash: string;
}

export function getStorablePassword(password: string): StorablePassword {
  const salt = genRandomString(100);
  const passwordHash = hashString(password, salt);

  return {salt, passwordHash};
}
