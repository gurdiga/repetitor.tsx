import * as assert from "assert";
import {genRandomString, hashString} from "App/Utils/StringUtils";
import {runQuery} from "App/DB";

interface Params {
  email: string;
  password: string;
}

export async function RegisterUser(params: Params): Promise<void> {
  const {email, password} = params;

  assert(email, "Email is required");
  assert(password, "Password is required");

  const {salt, passwordHash} = getStorablePassword(password);

  try {
    await runQuery({
      sql: `
          INSERT INTO users(email, password_hash, password_salt)
          VALUES(?, ?, ?)
        `,
      params: [email, passwordHash, salt],
    });
  } catch (e) {
    switch (e.code) {
      case "ER_DUP_ENTRY":
        return Promise.reject(new Error("Există deja un cont cu acest email"));
      default:
        console.error(e);
        return Promise.reject(new Error("Eroare de bază de date"));
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
