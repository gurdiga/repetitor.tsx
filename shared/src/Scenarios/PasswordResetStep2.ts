import {
  PasswordResetTokenError,
  PasswordResetTokenUnknownError,
  PasswordResetSuccess,
} from "shared/src/Model/PasswordResetStep2";
import {SystemError} from "shared/src/Model/Utils";
import {PasswordError} from "shared/src/Model/Password";

export interface PasswordResetStep2Input {
  token: string | undefined;
  newPassword: string | undefined;
}

export type PasswordResetStep2Result =
  | PasswordResetSuccess
  | PasswordResetTokenError
  | PasswordResetTokenUnknownError
  | PasswordError
  | SystemError;
