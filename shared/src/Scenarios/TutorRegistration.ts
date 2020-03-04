import {SystemError} from "shared/Model/Utils";
import {TutorPropError, TutorModelError, TutorCreationSuccess} from "shared/Model/Tutor";

export interface TutorRegistrationInput {
  fullName: string | undefined;
  email: string | undefined;
  password: string | undefined;
}

export type TutorRegistrationResult = TutorCreationSuccess | TutorPropError | TutorModelError | SystemError;
