import {
  EmailChanged,
  EmailChangeTokenUnrecognizedError,
  EmailChangeTokenValidationError,
} from "shared/src/Model/EmailChange";
import {ProfileNotFoundError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface EmailChangeStep2Input {
  token: string | undefined;
}
export type EmailChangeStep2Result =
  | EmailChanged
  | EmailChangeTokenValidationError
  | EmailChangeTokenUnrecognizedError
  | ProfileNotFoundError
  | SystemError;
