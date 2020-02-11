import {LoginCheckError, LoginCheckInfo} from "shared/Model/LoginCheck";
import {UserModelError} from "shared/Model/User";
import {DbError, Success, SystemError} from "shared/Model/Utils";
import {runQuery} from "Utils/Db";
import {logError} from "Utils/Logging";

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
        logError("DbError", error);

        return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
    }
  }
}

export async function checkLoginInfo(
  email: string,
  password: string,
  hashFn: (password: string, salt: string) => string
): Promise<LoginCheckInfo | LoginCheckError | SystemError> {
  try {
    const result = await runQuery({
      sql: `
            SELECT id, password_salt, password_hash
            FROM users
            WHERE email = ?
          `,
      params: [email],
    });

    const row = result.rows[0];

    if (row) {
      const {id, password_salt: passwordSalt, password_hash: passwordHash} = row;

      if (hashFn(password, passwordSalt) === passwordHash) {
        return {kind: "LoginCheckInfo", userId: id};
      } else {
        return {kind: "IncorrectPasswordError"};
      }
    } else {
      return {kind: "UnknownEmailError"};
    }
  } catch (error) {
    logError("DbError", error);

    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}
