import {RowSet, runQuery} from "backend/src/Db";
import {logError} from "backend/src/ErrorLogging";
import {updateProfile} from "backend/src/Persistence/AccountPersistence";
import {getRandomString} from "backend/src/StringUtils";
import {
  EmailChanged,
  EmailChangeTokenUnrecognizedError,
  EmailChangeTokenVerified,
  EMAIL_CHANGE_TOKEN_LENGTH,
  RequestCreated,
} from "shared/src/Model/EmailChange";
import {ProfileNotFoundError} from "shared/src/Model/Profile";
import {DbError, UnexpectedError} from "shared/src/Model/Utils";

export const EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS = 1;
export const EMAIL_CHANGE_TOKEN_EXPIRATION_TIME = EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS * 3600 * 1000;

export async function registerEmailChangeRequest(
  userId: number,
  currentEmail: string,
  newEmail: string
): Promise<RequestCreated | DbError> {
  const token = getRandomString(EMAIL_CHANGE_TOKEN_LENGTH);
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
): Promise<EmailChanged | ProfileNotFoundError | DbError | UnexpectedError> {
  recordPreviousEmail(userId, currentEmail);

  const profileUpdateResult = await updateProfile(userId, {email: newEmail});

  if (profileUpdateResult.kind === "ProfileUpdated") {
    return {
      kind: "EmailChanged",
    };
  } else {
    return profileUpdateResult;
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
