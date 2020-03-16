import {
  PasswordResetTokenError,
  PasswordResetTokenUnknownError,
  TutorPasswordResetSuccess,
} from "shared/Model/TutorPasswordResetStep2";
import {SystemError} from "shared/Model/Utils";
import {PasswordError} from "shared/Model/Password";

export interface TutorPasswordResetStep2Input {
  token: string | undefined;
  newPassword: string | undefined;
}

export type TutorPasswordResetStep2Result =
  | TutorPasswordResetSuccess
  | PasswordResetTokenError
  | PasswordResetTokenUnknownError
  | PasswordError
  | SystemError;
