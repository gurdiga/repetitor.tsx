import {LoginCheckError, LoginCheckInfo, UnknownEmailError} from "shared/Model/LoginCheck";
import {TutorModelError, TutorCreationSuccess} from "shared/Model/Tutor";
import {DbError, SystemError} from "shared/Model/Utils";
import {runQuery, InsertResult, RowSet} from "Utils/Db";
import {logError} from "Utils/Logging";
import {EmailExists, RecoveryToken} from "shared/Model/TutorPasswordRecovery";
import {genRandomString} from "Utils/StringUtils";

export async function createTutor(
  fullName: string,
  email: string,
  passwordHash: string,
  salt: string
): Promise<TutorCreationSuccess | TutorModelError | DbError> {
  try {
    const result = (await runQuery({
      sql: `
            INSERT INTO users(email, password_hash, password_salt, full_name)
            VALUES(?, ?, ?, ?)
          `,
      params: [email, passwordHash, salt, fullName],
    })) as InsertResult;

    return {kind: "TutorCreationSuccess", id: result.insertId};
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
    const result = (await runQuery({
      sql: `
            SELECT id, password_salt, password_hash
            FROM users
            WHERE email = ?
          `,
      params: [email],
    })) as RowSet;

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

export async function checkIfEmailExists(email: string): Promise<EmailExists | UnknownEmailError | SystemError> {
  try {
    const result = (await runQuery({
      sql: `
            SELECT id, full_name
            FROM users
            WHERE email = ?
           `,
      params: [email],
    })) as RowSet;

    const row = result.rows[0];

    if (row) {
      return {
        kind: "EmailExists",
        userId: row["id"],
        fullName: row["full_name"],
      };
    } else {
      return {kind: "UnknownEmailError"};
    }
  } catch (error) {
    logError("DbError", error);

    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

export async function createTutorPasswordRecoveryToken(userId: number): Promise<RecoveryToken | DbError> {
  const token = genRandomString(16);
  const timestamp = Date.now();

  try {
    await runQuery({
      sql: `
            INSERT INTO passsword_recovery_tokens (userId, token, timestamp)
            VALUES(?, ?, ?)
           `,
      params: [userId, token, timestamp],
    });

    return {
      kind: "RecoveryToken",
      token,
    };
  } catch (error) {
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}
