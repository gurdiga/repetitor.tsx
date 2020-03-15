import {EmailError} from "shared/Model/Email";
import {SystemError} from "shared/Model/Utils";
import {UnknownEmailError} from "shared/Model/LoginCheck";
import {TutorPasswordResetEmailSent} from "shared/Model/TutorPasswordResetStep1";

export interface TutorPasswordResetStep1Input {
  email: string | undefined;
}

export type TutorPasswordResetStep1Result = TutorPasswordResetEmailSent | EmailError | UnknownEmailError | SystemError;
