import {EmailError} from "shared/Model/Email";
import {SystemError} from "shared/Model/Utils";
import {UnknownEmailError} from "shared/Model/LoginCheck";
import {TutorPasswordRecoveryEmailSent} from "shared/Model/TutorPasswordRecovery";

export interface TutorPasswordRecoveryInput {
  email?: string;
}

export type TutorPasswordRecoveryResult = TutorPasswordRecoveryEmailSent | EmailError | UnknownEmailError | SystemError;
