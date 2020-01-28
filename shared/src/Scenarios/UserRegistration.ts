import {Success, UserModelError, UserPropError} from "shared/Model/User";
import {DbError, UnexpectedError} from "shared/Model/Errors";

export interface UserRegistrationDTO {
  fullName?: string;
  email?: string;
  password?: string;
}

export type UserRegistrationResult = Success | UserPropError | UserModelError | DbError | UnexpectedError;
