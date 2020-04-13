import {SystemError} from "shared/src/Model/Utils";
import {AccountPropError, AccountModelError, AccountCreationSuccess} from "shared/src/Model/Tutor";

export interface RegistrationInput {
  fullName: string | undefined;
  email: string | undefined;
  password: string | undefined;
}

export type RegistrationResult = AccountCreationSuccess | AccountPropError | AccountModelError | SystemError;
