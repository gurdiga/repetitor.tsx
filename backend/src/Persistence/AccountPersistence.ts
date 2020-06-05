import {RowSet, runQuery, StatementResult} from "backend/src/Db";
import {logError} from "backend/src/ErrorLogging";
import {genRandomString, StorablePassword} from "backend/src/StringUtils";
import {AccountCreationSuccess, AccountModelError} from "shared/src/Model/Account";
import {LoginCheckError, LoginCheckInfo, UnknownEmailError} from "shared/src/Model/LoginCheck";
import {
  EmailExists,
  PasswordResetSuccess,
  PasswordResetToken,
  PasswordResetTokenUnknownError,
  PasswordResetTokenVerified,
  PurgedExpiredTokens,
} from "shared/src/Model/PasswordReset";
import {ProfileLoaded, ProfileNotFoundError, ProfileUpdated} from "shared/src/Model/Profile";
import {DataProps, DbError, SystemError, UnexpectedError} from "shared/src/Model/Utils";
import {camelCaseToUnderscore} from "shared/src/Utils/StringUtils";

export async function createTutor(
  fullName: string,
  email: string,
  passwordHash: string,
  salt: string,
  emailConfirmationToken: string
): Promise<AccountCreationSuccess | AccountModelError | DbError> {
  try {
    const result = (await runQuery({
      sql: `
            INSERT INTO users(email, password_hash, password_salt, full_name, email_confirmation_token, is_email_confirmed)
            VALUES(?, ?, ?, ?, ?, false)
          `,
      params: [email, passwordHash, salt, fullName, emailConfirmationToken],
    })) as StatementResult;

    return {kind: "AccountCreationSuccess", id: result.insertId};
  } catch (error) {
    switch (error.code) {
      case "ER_DUP_ENTRY":
        return {kind: "AccountModelError", errorCode: "EMAIL_TAKEN"};
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

export async function createPasswordResetToken(userId: number): Promise<PasswordResetToken | DbError> {
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

    return {kind: "PasswordResetToken", token};
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

export async function resetPassword(
  userId: number,
  storablePassword: StorablePassword
): Promise<PasswordResetSuccess | DbError> {
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

    return {kind: "PasswordResetSuccess"};
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

export async function verifyToken(
  token: string
): Promise<PasswordResetTokenVerified | PasswordResetTokenUnknownError | DbError> {
  await purgeExpiredTokens();

  try {
    const result = (await runQuery({
      sql: `
            SELECT users.id, users.email, users.full_name
            FROM users
            LEFT JOIN passsword_reset_tokens ON passsword_reset_tokens.user_id = users.id
            WHERE passsword_reset_tokens.token = ?
          `,
      params: [token.slice(0, PASSWORD_RESET_TOKEN_LENGTH)],
    })) as RowSet;

    const row = result.rows[0];

    if (!row) {
      return {kind: "PasswordResetTokenUnknownError"};
    }

    return {
      kind: "PasswordResetTokenVerified",
      userId: row.id,
      email: row.email,
      fullName: row.full_name,
    };
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

export const PASSWORD_RESET_EXPIRATION_HOURS = 1;
export const TOKEN_EXPIRATION_TIME = PASSWORD_RESET_EXPIRATION_HOURS * 3600 * 1000;

async function purgeExpiredTokens(): Promise<void> {
  const expirationTimestamp = Date.now() - TOKEN_EXPIRATION_TIME;

  try {
    await runQuery({
      sql: `
            DELETE FROM passsword_reset_tokens
            WHERE timestamp < ?
          `,
      params: [expirationTimestamp],
    });
  } catch (error) {
    logError(error);
  }
}

export async function deleteToken(token: string): Promise<PurgedExpiredTokens | DbError> {
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

export async function loadProfile(
  userId: number
): Promise<ProfileLoaded | ProfileNotFoundError | UnexpectedError | DbError> {
  try {
    const result = (await runQuery({
      sql: `
            SELECT *
            FROM users
            WHERE id = ?
          `,
      params: [userId],
    })) as RowSet;

    try {
      const row = result.rows[0];

      if (row) {
        return {
          kind: "ProfileLoaded",
          fullName: row.full_name,
          email: row.email,
          resume: row.resume,
          isPublished: Boolean(row.is_published),
          avatarFilename: row.avatar_filename,
        };
      } else {
        return {kind: "ProfileNotFoundError"};
      }
    } catch (error) {
      logError(error);
      return {kind: "UnexpectedError", error: "Error loading profile"};
    }
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}

export async function updateProfile(
  userId: number,
  fields: Partial<DataProps<ProfileLoaded>>
): Promise<ProfileUpdated | ProfileNotFoundError | UnexpectedError | DbError> {
  try {
    const fieldPlaceholders = Object.keys(fields)
      .map(camelCaseToUnderscore)
      .map((x) => `\n${x} = ?`)
      .join(",");
    const fieldValues = Object.values(fields);

    const result = (await runQuery({
      sql: `
            UPDATE users
            SET ${fieldPlaceholders}
            WHERE id = ?
          `,
      params: [...fieldValues, userId],
    })) as StatementResult;

    try {
      const {affectedRows} = result;

      // I assume that users.id has a unique constraint, and there can only be
      // 1 or 0 records with a given ID.
      if (affectedRows === 1) {
        return {kind: "ProfileUpdated"};
      } else {
        return {kind: "ProfileNotFoundError"};
      }
    } catch (error) {
      logError(error);
      return {kind: "UnexpectedError", error: error.message};
    }
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}
