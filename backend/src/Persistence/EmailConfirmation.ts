import {RowSet, runQuery} from "backend/src/Db";
import {logError} from "backend/src/ErrorLogging";
import {EmailConfirmationTokenUnrecognizedError, EmailConfirmed} from "shared/src/Model/EmailConfirmation";
import {DbError} from "shared/src/Model/Utils";

export async function verifyEmailConfirmationToken(
  token: string
): Promise<EmailConfirmed | EmailConfirmationTokenUnrecognizedError | DbError> {
  try {
    const verificationResult = (await runQuery({
      sql: `
            SELECT id, email
            FROM users
            WHERE email_confirmation_token = ?
           `,
      params: [token],
    })) as RowSet;

    const row = verificationResult.rows[0];

    if (!row) {
      return {kind: "EmailConfirmationTokenUnrecognizedError"};
    }

    await runQuery({
      sql: `
              UPDATE users
              SET
                is_email_confirmed = 1
              WHERE email_confirmation_token = ?
            `,
      params: [token],
    });

    return {
      kind: "EmailConfirmed",
      userId: row.id as number,
      email: row.email as string,
    };
  } catch (error) {
    logError(error);
    return {kind: "DbError", errorCode: "GENERIC_DB_ERROR"};
  }
}
