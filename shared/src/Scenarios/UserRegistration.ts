import {Success, DbError, UnexpectedError} from "shared/Model/Utils";
import {UserPropError, UserModelError} from "shared/Model/User";
import {UserValue, ValidationRules} from "shared/Utils/Validation";

export interface UserRegistrationDTO {
  fullName?: string;
  email?: string;
  password?: string;
}

export type UserRegistrationResult = Success | UserPropError | UserModelError | DbError | UnexpectedError;
