import {Success, SystemError} from "shared/Model/Utils";
import {TutorPropError, TutorModelError} from "shared/Model/Tutor";

export interface TutorRegistrationDTO {
  fullName?: string;
  email?: string;
  password?: string;
}

export type TutorRegistrationResult = Success | TutorPropError | TutorModelError | SystemError;
