import {EmailError} from "shared/Model/Email";
import {SystemError} from "shared/Model/Utils";
import {UnknownEmailError} from "shared/Model/LoginCheck";
import {TutorPasswordResetEmailSent} from "shared/Model/TutorPasswordReset";

export interface TutorPasswordResetInput {
  email: string | undefined;
}

export type TutorPasswordResetResult = TutorPasswordResetEmailSent | EmailError | UnknownEmailError | SystemError;
