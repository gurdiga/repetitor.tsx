import {DataProps} from "shared/Model/Utils";
import {TutorPasswordResetStep2Input} from "shared/Scenarios/TutorPasswordResetStep2";
import {UserValue, PredicateFn, ValidationMessages, validateWithRules} from "shared/Utils/Validation";
import {UserPasswordValidationRules, PasswordError} from "shared/Model/Password";

export interface TutorPasswordResetStep2Request {
  kind: "TutorPasswordResetStep2Request";
  token: string;
  newPassword: string;
}

export type TutorPasswordResetStep2PropName = keyof DataProps<TutorPasswordResetStep2Request>;

export interface TutorPasswordResetSuccess {
  kind: "TutorPasswordResetSuccess";
}

export type PasswordResetTokenError = {
  kind: "PasswordResetTokenError";
  errorCode: PasswordResetTokenValidationErrorCode;
};

type PasswordResetTokenValidationErrorCode = "REQUIRED";

export const PasswordResetTokenValidationRules: Record<PasswordResetTokenValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const tokenErrorMessages: ValidationMessages<typeof PasswordResetTokenValidationRules> = {
  REQUIRED: "Tokenul de resetare a parolei lipsește",
};

export type PasswordResetTokenUnknownError = {
  kind: "PasswordResetTokenUnknownError";
};

export function TutorPasswordResetStep2RequestFromInput(
  input: TutorPasswordResetStep2Input
): TutorPasswordResetStep2Request | PasswordResetTokenError | PasswordError {
  const tokenValidationResult = validateWithRules(input.token, PasswordResetTokenValidationRules);

  if (tokenValidationResult.kind === "Invalid") {
    return {kind: "PasswordResetTokenError", errorCode: tokenValidationResult.validationErrorCode};
  }

  const passwordValidationResult = validateWithRules(input.token, UserPasswordValidationRules);

  if (passwordValidationResult.kind === "Invalid") {
    return {kind: "PasswordError", errorCode: passwordValidationResult.validationErrorCode};
  }

  return {
    kind: "TutorPasswordResetStep2Request",
    token: tokenValidationResult.value,
    newPassword: passwordValidationResult.value,
  };
}
