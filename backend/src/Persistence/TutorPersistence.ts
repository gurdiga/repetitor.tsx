import {LoginCheckError, LoginCheckInfo, UnknownEmailError} from "shared/Model/LoginCheck";
import {TutorModelError, TutorCreationSuccess} from "shared/Model/Tutor";
import {DbError, SystemError} from "shared/Model/Utils";
import {runQuery, InsertResult, RowSet} from "Utils/Db";
import {EmailExists, PasswordResetToken} from "shared/Model/TutorPasswordResetStep1";
import {genRandomString, StorablePassword} from "Utils/StringUtils";
import {
  PasswordResetTokenUnknownError,
  TutorPasswordResetSuccess,
  PasswordResetTokenVerified,
  PurgedExpiredTokens,
} from "shared/Model/TutorPasswordResetStep2";
import {logError} from "Utils/Logging";

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
        logError(error);
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
    logError(error);
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
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

const PASSWORD_RESET_TOKEN_LENGTH = 16;

export async function createTutorPasswordResetToken(userId: number): Promise<PasswordResetToken | DbError> {
  const token = genRandomString(PASSWORD_RESET_TOKEN_LENGTH);
  const timestamp = Date.now();

  try {
    await runQuery({
      sql: `
            INSERT INTO passsword_reset_tokens (user_id, token, timestamp)
            VALUES(?, ?, ?)
           `,
      params: [userId, token, timestamp],
    });

    return {
      kind: "PasswordResetToken",
      token,
    };
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

export async function resetTutorPassword(
  token: string,
  storablePassword: StorablePassword
): Promise<TutorPasswordResetSuccess | PasswordResetTokenUnknownError | DbError> {
  const tokenVerificationResult = await verifyToken(token);

  if (tokenVerificationResult.kind !== "PasswordResetTokenVerified") {
    return tokenVerificationResult;
  }

  await deleteToken(token);

  const {userId} = tokenVerificationResult;

  return await resetPassword(userId, storablePassword);
}

async function resetPassword(
  userId: number,
  storablePassword: StorablePassword
): Promise<TutorPasswordResetSuccess | DbError> {
  const {passwordHash, passwordSalt: salt} = storablePassword;

  try {
    await runQuery({
      sql: `
            UPDATE users
            SET
              password_hash = ?,
              password_salt = ?
            WHERE id = ?
          `,
      params: [passwordHash, salt, userId],
    });

    return {kind: "TutorPasswordResetSuccess"};
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

async function verifyToken(
  token: string
): Promise<PasswordResetTokenUnknownError | PasswordResetTokenVerified | DbError> {
  await purgeExpiredTokens();

  try {
    const result = (await runQuery({
      sql: `
            SELECT user_id
            FROM passsword_reset_tokens
            WHERE token = ?
          `,
      params: [token.slice(0, PASSWORD_RESET_TOKEN_LENGTH)],
    })) as RowSet;

    const row = result.rows[0];

    if (!row) {
      return {kind: "PasswordResetTokenUnknownError"};
    }

    return {
      kind: "PasswordResetTokenVerified",
      userId: row.userId,
    };
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

const hour = 3600 * 1000;
export const TOKEN_EXPIRATION_TIME = 1 * hour;

async function purgeExpiredTokens(): Promise<PurgedExpiredTokens | DbError> {
  const expirationTimestamp = Date.now() - TOKEN_EXPIRATION_TIME;

  try {
    await runQuery({
      sql: `
            DELETE FROM passsword_reset_tokens
            WHERE timestamp < ?
          `,
      params: [expirationTimestamp],
    });

    return {kind: "PurgedExpiredTokens"};
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

async function deleteToken(token: string): Promise<PurgedExpiredTokens | DbError> {
  try {
    await runQuery({
      sql: `
            DELETE FROM passsword_reset_tokens
            WHERE token = ?
          `,
      params: [token.slice(0, PASSWORD_RESET_TOKEN_LENGTH)],
    });

    return {kind: "PurgedExpiredTokens"};
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}
