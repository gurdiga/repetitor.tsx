import {PasswordError} from "shared/src/Model/Password";
import {
  PasswordResetSuccess,
  PasswordResetTokenError,
  PasswordResetTokenUnknownError,
} from "shared/src/Model/PasswordReset";
import {SystemError} from "shared/src/Model/Utils";

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
