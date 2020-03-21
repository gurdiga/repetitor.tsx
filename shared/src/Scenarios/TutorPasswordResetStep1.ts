import {EmailError} from "shared/src/Model/Email";
import {SystemError} from "shared/src/Model/Utils";
import {UnknownEmailError} from "shared/src/Model/LoginCheck";
import {TutorPasswordResetEmailSent} from "shared/src/Model/TutorPasswordResetStep1";

export interface TutorPasswordResetStep1Input {
  email: string | undefined;
}

export type TutorPasswordResetStep1Result = TutorPasswordResetEmailSent | EmailError | UnknownEmailError | SystemError;
