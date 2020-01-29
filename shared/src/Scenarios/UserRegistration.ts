import {Success, DbError, UnexpectedError} from "shared/Model/Utils";
import {UserPropError, UserModelError} from "shared/Model/User";
import {PredicateFn, UserValue} from "shared/Utils/Validation";

export interface UserRegistrationDTO {
  fullName?: string;
  email?: string;
  password?: string;
}

export type UserRegistrationResult = Success | UserPropError | UserModelError | DbError | UnexpectedError;

// This is not included in UserValidationRules because it’s only used on the
// front-end.
export const userLicenceAggreementCheckboxValidationRules: Record<string, PredicateFn> = {
  REQUIRE_ACCEPTANCE: (value: UserValue) => value === "on",
};
