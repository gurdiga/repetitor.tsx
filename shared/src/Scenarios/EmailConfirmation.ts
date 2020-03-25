import {
  EmailConfirmationTokenValidationError,
  EmailConfirmationTokenUnrecognizedError,
  EmailConfirmed,
} from "shared/src/Model/EmailConfirmation";
import {SystemError} from "shared/src/Model/Utils";

export interface EmailConfirmationInput {
  token: string | undefined;
}

export type EmailConfirmationResult =
  | EmailConfirmed
  | EmailConfirmationTokenValidationError
  | EmailConfirmationTokenUnrecognizedError
  | SystemError;
