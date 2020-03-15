import {
  PasswordResetTokenError,
  PasswordResetTokenUnknownError,
  TutorPasswordResetSuccess,
} from "shared/Model/TutorPasswordResetStep2";
import {SystemError} from "shared/Model/Utils";

export interface TutorPasswordResetStep2Input {
  token: string | undefined;
  newPassword: string | undefined;
}

export type TutorPasswordResetStep2Result =
  | TutorPasswordResetSuccess
  | PasswordResetTokenError
  | PasswordResetTokenUnknownError
  | SystemError;
