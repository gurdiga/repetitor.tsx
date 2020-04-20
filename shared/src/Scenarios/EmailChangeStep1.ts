import {EmailError} from "shared/src/Model/Email";
import {EmailChangeConfirmationSent} from "shared/src/Model/EmailChange";
import {NotAuthenticatedError, ProfileNotFoundError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface EmailChangeStep1Input {
  newEmail: string | undefined;
}

/**
 * - step1: add a record to email_change_requests table (create it first)
 * - step1: send a message to the new email address with a magic link
 * - step1: when they click the magic link in the email they begin step2
 *
 * - step2: verify the link magic
 * - step2: insert the previous email address in previous_email_addresses (create it first),
 * - step2: update the current email
 * - step2: and delete the change request in email_change_requests.
 */

export type EmailChangeStep2Result =
  | EmailChangeConfirmationSent
  | EmailError
  | ProfileNotFoundError
  | NotAuthenticatedError
  | SystemError;
