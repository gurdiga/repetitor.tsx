import {EmailError} from "shared/src/Model/Email";
import {EmailChangeConfirmationRequestSent, EmailIsTheSameError} from "shared/src/Model/EmailChange";
import {NotAuthenticatedError, ProfileNotFoundError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface EmailChangeStep1Input {
  newEmail: string | undefined;
}

export type EmailChangeStep1Result =
  | EmailChangeConfirmationRequestSent
  | EmailError
  | EmailIsTheSameError
  | ProfileNotFoundError
  | NotAuthenticatedError
  | SystemError;
