import {log} from "console";
import {LoginCheckError, LoginCheckSuccess} from "shared/Model/LoginCheck";
import {UserModelError} from "shared/Model/User";
import {DbError, Success, SystemError} from "shared/Model/Utils";
import {runQuery} from "Utils/Db";

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

export async function getUserId(
  email: string,
  passwordHash: string
): Promise<LoginCheckSuccess | LoginCheckError | SystemError> {
  try {
    const result = await runQuery({
      sql: `
            SELECT id
            FROM users
            WHERE email = ? AND password_hash = ?
          `,
      params: [email, passwordHash],
    });

    console.log(`result`, result);

    const userId = result.rows[0].id;

    return {kind: "LoginCheckSuccess", userId};
  } catch (error) {
    log("Unexpected DB error", error);
    return {kind: "DbError", errorCode: "ERROR"};
  }
}
