import {RowSet, runQuery} from "backend/src/Utils/Db";
import {logError} from "backend/src/Utils/Logging";
import {genRandomString} from "backend/src/Utils/StringUtils";
import {
  EmailChangeConfirmed,
  EmailChangeRequest,
  EmailChangeTokenUnrecognizedError,
  EmailChangeTokenVerified,
  EMAIL_CHANGE_TOKEN_LENGTH,
  RequestCreated,
} from "shared/src/Model/EmailChange";
import {DbError} from "shared/src/Model/Utils";

export const EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS = 1;
export const EMAIL_CHANGE_TOKEN_EXPIRATION_TIME = EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS * 3600 * 1000;

export async function registerEmailChangeRequest(
  userId: number,
  emailChangeRequest: EmailChangeRequest
): Promise<RequestCreated | DbError> {
  const {currentEmail, newEmail} = emailChangeRequest;
  const token = genRandomString(EMAIL_CHANGE_TOKEN_LENGTH);
  const timestamp = Date.now();

  try {
    await runQuery({
      sql: `
        INSERT INTO email_change_requests (user_id, current_email, new_email, token, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `,
      params: [userId, currentEmail, newEmail, token, timestamp],
    });

    return {
      kind: "RequestCreated",
      token,
    };
  } catch (error) {
    return {
      kind: "DbError",
      errorCode: "GENERIC_DB_ERROR",
    };
  }
}

export async function verifyEmailChangeToken(
  token: string
): Promise<EmailChangeTokenVerified | EmailChangeTokenUnrecognizedError | DbError> {
  await purgeExpiredEmailChangeTokens();

  try {
    const result = (await runQuery({
      sql: `
          SELECT user_id, new_email, current_email
          FROM email_change_requests
          WHERE token = ?
        `,
      params: [token],
    })) as RowSet;

    const row = result.rows[0];

    if (!row) {
      return {kind: "EmailChangeTokenUnrecognizedError"};
    }

    await runQuery({
      sql: `
          DELETE FROM email_change_requests
          WHERE token = ?
        `,
      params: [token],
    });

    return {
      kind: "EmailChangeTokenVerified",
      userId: row.user_id,
      newEmail: row.new_email,
      currentEmail: row.current_email,
    };
  } catch (error) {
    return {
      kind: "DbError",
      errorCode: "GENERIC_DB_ERROR",
    };
  }
}

async function purgeExpiredEmailChangeTokens(): Promise<void> {
  const expirationTimestamp = Date.now() - EMAIL_CHANGE_TOKEN_EXPIRATION_TIME;

  try {
    await runQuery({
      sql: `
            DELETE FROM email_change_requests
            WHERE timestamp < ?
          `,
      params: [expirationTimestamp],
    });
  } catch (error) {
    logError(error);
  }
}

export async function changeEmail(
  userId: number,
  newEmail: string,
  currentEmail: string
): Promise<EmailChangeConfirmed | DbError> {
  recordPreviousEmail(userId, currentEmail);

  try {
    await runQuery({
      sql: `
        UPDATE users
        SET email = ?
        WHERE id = ?
      `,
      params: [newEmail, userId],
    });

    return {
      kind: "EmailChangeConfirmed",
    };
  } catch (error) {
    return {
      kind: "DbError",
      errorCode: "GENERIC_DB_ERROR",
    };
  }
}

async function recordPreviousEmail(userId: number, email: string): Promise<void> {
  const timestamp = Date.now();

  try {
    await runQuery({
      sql: `
            INSERT INTO previous_emails (user_id, email, timestamp)
            VALUES (?, ?, ?)
          `,
      params: [userId, email, timestamp],
    });
  } catch (error) {
    logError(error);
  }
}
