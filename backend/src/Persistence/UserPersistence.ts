import {runQuery} from "Utils/Db";
import {Success, UserModelError} from "shared/Model/User";
import {log} from "console";
import {DbError} from "shared/Model/Errors";

export async function createUser(
  fullName: string,
  email: string,
  passwordHash: string,
  salt: string
): Promise<Success | UserModelError | DbError> {
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
        log("Unexpected DB error", error);
        return {kind: "DbError", errorCode: "ERROR"};
    }
  }
}
