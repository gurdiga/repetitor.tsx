import {TutorRegistrationInput} from "shared/src/Scenarios/TutorRegistration";
import {PredicateFn, UserValue, validateWithRules, ValidationMessages} from "shared/src/Utils/Validation";
import {DataProps} from "shared/src/Model/Utils";
import {EmailError, UserEmailValidationRules} from "shared/src/Model/Email";
import {PasswordError, UserPasswordValidationRules} from "shared/src/Model/Password";

export interface TutorRegistrationRequest {
  kind: "TutorRegistrationRequest";
  fullName: string;
  email: string;
  password: string;
}

export type TutorPropName = keyof DataProps<TutorRegistrationRequest>;

export const TutorFullNameValidationRules: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  TOO_SHORT: (text: UserValue) => !!text && text.trim().length >= 5,
  TOO_LONG: (text: UserValue) => !!text && text.trim().length <= 50,
};

export const FullNameErrorMessages: ValidationMessages<typeof TutorFullNameValidationRules> = {
  REQUIRED: "Numele deplin lipsește",
  TOO_SHORT: "Numele este prea scurt",
  TOO_LONG: "Numele este prea lung",
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

export function makeTutorRegistrationRequestFromInput(
  input: TutorRegistrationInput
): TutorRegistrationRequest | TutorPropError | TutorModelError {
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
    kind: "TutorRegistrationRequest",
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
