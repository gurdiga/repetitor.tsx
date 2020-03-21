import {
  PasswordResetTokenError,
  PasswordResetTokenUnknownError,
  TutorPasswordResetSuccess,
} from "shared/src/Model/TutorPasswordResetStep2";
import {SystemError} from "shared/src/Model/Utils";
import {PasswordError} from "shared/src/Model/Password";

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
