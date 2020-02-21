import {TutorRegistrationInput} from "shared/Scenarios/TutorRegistration";
import {PredicateFn, UserValue, validateWithRules} from "shared/Utils/Validation";
import {DataProps} from "shared/Model/Utils";
import {EmailError, UserEmailValidationRules} from "shared/Model/Email";
import {PasswordError, UserPasswordValidationRules} from "shared/Model/Password";

export interface Tutor {
  kind: "User";
  fullName: string;
  email: string;
  password: string;
}

export type TutorPropName = keyof DataProps<Tutor>;

export const TutorFullNameValidationRules: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  TOO_SHORT: (text: UserValue) => !!text && text.trim().length >= 5,
  TOO_LONG: (text: UserValue) => !!text && text.trim().length <= 50,
};

export type TutorPropError = FullNameError | EmailError | PasswordError;

type FullNameError = {
  kind: "FullNameError";
  errorCode: FullNameValidationErrorCode;
};

export type FullNameValidationErrorCode = "REQUIRED" | "TOO_SHORT" | "TOO_LONG";

export type TutorModelError = {
  kind: "ModelError";
  errorCode: UserModelValidationErrorCode;
};

export type TutorCreationSuccess = {
  kind: "TutorCreationSuccess";
  id: number;
};

export type UserModelValidationErrorCode = "EMAIL_TAKEN";

export function makeTutorFromRegistrationFormInput(
  input: TutorRegistrationInput
): Tutor | TutorPropError | TutorModelError {
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
    kind: "User",
    fullName: fullNameValidationResult.value,
    email: emailValidationResult.value,
    password: passwordValidationResult.value,
  };
}

const UserValidationRules: Record<TutorPropName, Record<any, PredicateFn>> = {
  fullName: TutorFullNameValidationRules,
  email: UserEmailValidationRules,
  password: UserPasswordValidationRules,
};
