import assert from "assert";
import {runQuery} from "../Db";
import {genRandomString, hashString} from "../Utils/StringUtils";

interface Params {
  email: string;
  password: string;
  fullName: string;
}

interface Response {
  success: true;
}

export async function RegisterUser(params: Params): Promise<Response> {
  const {email, password, fullName} = params;

  assert(email, "Email is required");
  assert(password, "Password is required");
  assert(fullName, "Full name is required");

  const {salt, passwordHash} = getStorablePassword(password);

  try {
    await runQuery({
      sql: `
          INSERT INTO users(email, password_hash, password_salt, full_name)
          VALUES(?, ?, ?)
        `,
      params: [email, passwordHash, salt, fullName],
    });

    return Promise.resolve({success: true});
  } catch (e) {
    switch (e.code) {
      case "ER_DUP_ENTRY":
        return Promise.reject(new Error("EMAIL_TAKEN"));
      default:
        console.error(e);
        return Promise.reject(new Error("DB_ERROR"));
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
