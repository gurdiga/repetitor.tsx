import {runQuery} from "backend/src/Utils/Db";
import {EmailChangeRequest, RequestCreated} from "shared/src/Model/EmailChange";
import {DbError} from "shared/src/Model/Utils";
import {genRandomString} from "backend/src/Utils/StringUtils";

export const EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS = 1;
export const EMAIL_CHANGE_TOKEN_EXPIRATION_TIME = EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS * 3600 * 1000;

const EMAIL_CHANGE_TOKEN_LENGTH = 16;

export async function registerEmailChangeRequest(
  emailChangeRequest: EmailChangeRequest
): Promise<RequestCreated | DbError> {
  const {currentEmail, newEmail} = emailChangeRequest;
  const token = genRandomString(EMAIL_CHANGE_TOKEN_LENGTH);

  try {
    await runQuery({
      sql: `
        INSERT INTO email_change_requests (current_email, new_email, token)
        VALUES (?, ?, ?)
      `,
      params: [currentEmail, newEmail, token],
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
