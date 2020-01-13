import debug from "debug";
import {ActionRegistry} from "../../../../shared/src/ActionRegistry";
import {runQuery} from "../Db";
import {genRandomString, hashString} from "../Utils/StringUtils";

type Params = ActionRegistry["RegisterUser"]["Params"];
type Response = ActionRegistry["RegisterUser"]["Response"];

const log = debug("app:RegisterUser");

export async function RegisterUser(params: Params): Promise<Response> {
  const {email, password, fullName} = params;

  if (!email) {
    return {error: "EMAIL_REQUIRED"};
  } else if (!password) {
    return {error: "PASSWORD_REQUIRED"};
  } else if (!fullName) {
    return {error: "FULL_NAME_REQUIRED"};
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

      return {success: true};
    } catch (error) {
      switch (error.code) {
        case "ER_DUP_ENTRY":
          return {error: "EMAIL_TAKEN"};
        default:
          log({error});
          return {error: "DB_ERROR"};
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
