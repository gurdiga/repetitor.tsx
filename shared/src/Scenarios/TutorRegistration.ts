import {SystemError} from "shared/Model/Utils";
import {TutorPropError, TutorModelError, TutorCreationSuccess} from "shared/Model/Tutor";

export interface TutorRegistrationInput {
  fullName?: string;
  email?: string;
  password?: string;
}

export type TutorRegistrationResult = TutorCreationSuccess | TutorPropError | TutorModelError | SystemError;
