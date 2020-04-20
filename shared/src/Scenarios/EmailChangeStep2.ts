import {
  EmailChangeConfirmed,
  EmailChangeTokenUnrecognizedError,
  EmailChangeTokenValidationError,
} from "shared/src/Model/EmailChange";
import {SystemError} from "shared/src/Model/Utils";

export interface EmailChangeStep2Input {
  token: string | undefined;
}
export type EmailChangeStep2Result =
  | EmailChangeConfirmed
  | EmailChangeTokenValidationError
  | EmailChangeTokenUnrecognizedError
  | SystemError;
