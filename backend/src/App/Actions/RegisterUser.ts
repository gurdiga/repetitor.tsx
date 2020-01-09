import debug from "debug";
import {runQuery} from "../Db";
import {genRandomString, hashString} from "../Utils/StringUtils";
import {ActionDirectory} from "../../../../shared/src/ActionDirectory";

type Params = ActionDirectory["RegisterUser"]["Params"];
type Response = ActionDirectory["RegisterUser"]["Response"];

const log = debug("app:RegisterUser");

export async function RegisterUser(params: Params): Promise<Response> {
  const {email, password, fullName} = params;
  const {salt, passwordHash} = getStorablePassword(password);

  if (!email) {
    return {error: "EMAIL_REQUIRED"};
  } else if (!password) {
    return {error: "PASSWORD_REQUIRED"};
  } else if (!fullName) {
    return {error: "FULL_NAME_REQUIRED"};
  } else {
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
