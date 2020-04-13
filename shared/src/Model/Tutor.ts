import {RegistrationInput} from "shared/src/Scenarios/Registration";
import {PredicateFn, UserValue, validateWithRules, ValidationMessages} from "shared/src/Utils/Validation";
import {DataProps} from "shared/src/Model/Utils";
import {EmailError, EmailValidationRules} from "shared/src/Model/Email";
import {PasswordError, PasswordValidationRules} from "shared/src/Model/Password";

export interface RegistrationRequest {
  kind: "RegistrationRequest";
  fullName: string;
  email: string;
  password: string;
}

export type AccountPropName = keyof DataProps<RegistrationRequest>;

export const FullNameValidationRules: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  TOO_SHORT: (text: UserValue) => !!text && text.trim().length >= 5,
  TOO_LONG: (text: UserValue) => !!text && text.trim().length <= 50,
};

export const FullNameErrorMessages: ValidationMessages<typeof FullNameValidationRules> = {
  REQUIRED: "Numele deplin lipsește",
  TOO_SHORT: "Numele este prea scurt",
  TOO_LONG: "Numele este prea lung",
};

export type AccountPropError = FullNameError | EmailError | PasswordError;

export type FullNameError = {
  kind: "FullNameError";
  errorCode: FullNameValidationErrorCode;
};

export type FullNameValidationErrorCode = "REQUIRED" | "TOO_SHORT" | "TOO_LONG";

export type AccountModelError = {
  kind: "AccountModelError";
  errorCode: AccountModelValidationErrorCode;
};

export type AccountCreationSuccess = {
  kind: "AccountCreationSuccess";
  id: number;
};

export type AccountModelValidationErrorCode = "EMAIL_TAKEN";

export function makeRegistrationRequestFromInput(
  input: RegistrationInput
): RegistrationRequest | AccountPropError | AccountModelError {
  const fullNameValidationResult = validateWithRules(input.fullName, UserValidationRules.fullName);

  if (fullNameValidationResult.kind === "Invalid") {
    return {kind: "FullNameError", errorCode: fullNameValidationResult.validationErrorCode};
  }

  const emailValidationResult = validateWithRules(input.email, UserValidationRules.email);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  const passwordValidationResult = validateWithRules(input.password, UserValidationRules.password);

  if (passwordValidationResult.kind === "Invalid") {
    return {kind: "PasswordError", errorCode: passwordValidationResult.validationErrorCode};
  }

  return {
    kind: "RegistrationRequest",
    fullName: fullNameValidationResult.value,
    email: emailValidationResult.value,
    password: passwordValidationResult.value,
  };
}

export const UserValidationRules: Record<AccountPropName, Record<any, PredicateFn>> = {
  fullName: FullNameValidationRules,
  email: EmailValidationRules,
  password: PasswordValidationRules,
};
