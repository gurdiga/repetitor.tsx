import {UserRegistrationDTO} from "shared/Scenarios/UserRegistration";
import {PredicateFn, UserValue, validateWithRules, ValidationMessages} from "shared/Utils/Validation";
import {DataProps} from "shared/Model/Utils";
import {EmailError, UserEmailValidationRules} from "shared/Model/Email";
import {PasswordError, UserPasswordValidationRules} from "shared/Model/Password";

export interface User {
  kind: "User";
  fullName: string;
  email: string;
  password: string;
}

export type UserPropName = keyof DataProps<User>;

export const UserFullNameValidationRules: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  TOO_SHORT: (text: UserValue) => !!text && text.trim().length >= 5,
  TOO_LONG: (text: UserValue) => !!text && text.trim().length <= 50,
};

export type UserPropError = FullNameError | EmailError | PasswordError;

type FullNameError = {
  kind: "FullNameError";
  errorCode: FullNameValidationErrorCode;
};

export type FullNameValidationErrorCode = "REQUIRED" | "TOO_SHORT" | "TOO_LONG";

export type UserModelError = {
  kind: "ModelError";
  errorCode: UserModelValidationErrorCode;
};

export type UserModelValidationErrorCode = "EMAIL_TAKEN";

export function makeUserFromRegistrationFormDTO(
  registrationFormDTO: UserRegistrationDTO
): User | UserPropError | UserModelError {
  const fullNameValidationResult = validateWithRules(registrationFormDTO.fullName, UserValidationRules.fullName);

  if (fullNameValidationResult.kind === "Invalid") {
    return {kind: "FullNameError", errorCode: fullNameValidationResult.validationErrorCode};
  }

  const emailValidationResult = validateWithRules(registrationFormDTO.email, UserValidationRules.email);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  const passwordValidationResult = validateWithRules(registrationFormDTO.password, UserValidationRules.password);

  if (passwordValidationResult.kind === "Invalid") {
    return {kind: "PasswordError", errorCode: passwordValidationResult.validationErrorCode};
  }

  return {
    kind: "User",
    fullName: fullNameValidationResult.value,
    email: emailValidationResult.value,
    password: passwordValidationResult.value,
  };
}

const UserValidationRules: Record<UserPropName, Record<any, PredicateFn>> = {
  fullName: UserFullNameValidationRules,
  email: UserEmailValidationRules,
  password: UserPasswordValidationRules,
};
