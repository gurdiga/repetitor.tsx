import debug from "debug";
import {ActionRegistry} from "../../../../shared/src/ActionRegistry";
import {runQuery} from "../Db";
import {genRandomString, hashString} from "../Utils/StringUtils";
// import {validateWithRules, ValidationRules} from "shared/Validation";

type Params = ActionRegistry["RegisterUser"]["Params"];
type Response = ActionRegistry["RegisterUser"]["Response"];

const log = debug("app:RegisterUser");

export async function RegisterUser(params: Params): Promise<Response> {
  const {fullName, email, password} = params;

  // const {validationErrorCode, isValid} = validateWithRules(fullName, ValidationRules["RegisterUser"].fullName);

  // if (!isValid) {
  //   return {kind: "FullNameError", errorCode: validationErrorCode};
  // }

  if (!email) {
    return {kind: "EmailError", errorCode: "REQUIRED"};
  } else if (!password) {
    return {kind: "PasswordError", errorCode: "REQUIRED"};
  } else if (!fullName) {
    return {kind: "FullNameError", errorCode: "REQUIRED"};
  } else {
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
