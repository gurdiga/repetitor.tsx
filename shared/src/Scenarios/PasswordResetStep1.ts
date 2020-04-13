import {EmailError} from "shared/src/Model/Email";
import {SystemError} from "shared/src/Model/Utils";
import {UnknownEmailError} from "shared/src/Model/LoginCheck";
import {PasswordResetEmailSent} from "shared/src/Model/PasswordResetStep1";

export interface PasswordResetStep1Input {
  email: string | undefined;
}

export type PasswordResetStep1Result = PasswordResetEmailSent | EmailError | UnknownEmailError | SystemError;
