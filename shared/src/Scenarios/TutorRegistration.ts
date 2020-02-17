import {SystemError} from "shared/Model/Utils";
import {TutorPropError, TutorModelError, TutorCreationSuccess} from "shared/Model/Tutor";

export interface TutorRegistrationDTO {
  fullName?: string;
  email?: string;
  password?: string;
}

export type TutorRegistrationResult = TutorCreationSuccess | TutorPropError | TutorModelError | SystemError;
