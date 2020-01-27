import debug from "debug";
import {ActionRegistry} from "shared/ActionRegistry";
import {RegistrationFormDTO} from "shared/Scenarios/UserRegistration";
import {validateWithRules} from "shared/Validation";
import {UserValidationRules, makeUserFromRegistrationFormDTO} from "shared/Domain/User";
import {runQuery} from "src/App/Db";
import {genRandomString, hashString} from "src/App/Utils/StringUtils";

type Params = ActionRegistry["RegisterUser"]["Params"];
type Response = ActionRegistry["RegisterUser"]["Response"];

const log = debug("app:RegisterUser");

export async function RegisterUser(params: RegistrationFormDTO): Promise<Response> {
  const result = makeUserFromRegistrationFormDTO(params);

  if (result.kind === "User") {
    const {fullName, email, password} = result;
    const {salt, passwordHash} = getStorablePassword(password);

    try {
      await runQuery({
        sql: `
              INSERT INTO users(email, password_hash, password_salt, full_name)
              VALUES(?, ?, ?, ?)
            `,
        params: [email, passwordHash, salt, fullName],
      });

      return {kind: "Success"};
    } catch (error) {
      switch (error.code) {
        case "ER_DUP_ENTRY":
          return {kind: "ModelError", errorCode: "EMAIL_TAKEN"};
        default:
          log({error});
          return {kind: "DbError", errorCode: "ERROR"};
      }
    }
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
