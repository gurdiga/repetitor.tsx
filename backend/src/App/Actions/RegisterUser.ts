import debug from "debug";
import {RegistrationFormDTO} from "shared/Scenarios/UserRegistration";
import {genRandomString, hashString} from "src/App/Utils/StringUtils";
import {createUser} from "src/Persistence/UserPersistence";
import {makeUserFromRegistrationFormDTO, UserResult} from "shared/Domain/User";

const log = debug("app:RegisterUser");

export async function RegisterUser(params: RegistrationFormDTO): Promise<UserResult> {
  const result = makeUserFromRegistrationFormDTO(params);

  log({params, result});

  if (result.kind === "User") {
    const {fullName, email, password} = result;
    const {salt, passwordHash} = getStorablePassword(password);

    return createUser(fullName, email, passwordHash, salt);
  } else {
    return result;
  }
}

interface StorablePassword {
  salt: string;
  passwordHash: string;
}

export function getStorablePassword(password: string): StorablePassword {
  const salt = genRandomString(100);
  const passwordHash = hashString(password, salt);

  return {salt, passwordHash};
}
