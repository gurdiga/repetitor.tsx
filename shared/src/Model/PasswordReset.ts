import {EmailError, EmailValidationRules} from "shared/src/Model/Email";
import {PasswordError, PasswordValidationRules} from "shared/src/Model/Password";
import {DataProps} from "shared/src/Model/Utils";
import {PasswordResetStep1Input} from "shared/src/Scenarios/PasswordResetStep1";
import {PasswordResetStep2Input} from "shared/src/Scenarios/PasswordResetStep2";
import {PredicateFn, UserValue, validateWithRules, ValidationMessages} from "shared/src/Utils/Validation";

export interface PasswordResetStep1 {
  kind: "PasswordResetStep1";
  email: string;
}

export type PasswordResetStep1PropName = keyof DataProps<PasswordResetStep1>;

export interface PasswordResetEmailSent {
  kind: "PasswordResetEmailSent";
}

export type EmailExists = {
  kind: "EmailExists";
  userId: number;
  fullName: string;
};

export type PasswordResetToken = {
  kind: "PasswordResetToken";
  token: string;
};

export function makePasswordResetRequestFromInput(input: PasswordResetStep1Input): PasswordResetStep1 | EmailError {
  const emailValidationResult = validateWithRules(input.email, EmailValidationRules);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  return {
    kind: "PasswordResetStep1",
    email: emailValidationResult.value,
  };
}

export interface PasswordResetStep2Request {
  kind: "PasswordResetStep2Request";
  token: string;
  newPassword: string;
}

export type PasswordResetStep2PropName = keyof DataProps<PasswordResetStep2Request>;

export interface PasswordResetSuccess {
  kind: "PasswordResetSuccess";
}

export type PasswordResetTokenError = {
  kind: "PasswordResetTokenError";
  errorCode: PasswordResetTokenValidationErrorCode;
};

type PasswordResetTokenValidationErrorCode = "REQUIRED";

export const PasswordResetTokenValidationRules: Record<PasswordResetTokenValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const TokenErrorMessages: ValidationMessages<typeof PasswordResetTokenValidationRules> = {
  REQUIRED: "Tokenul de resetare a parolei lipsește",
};

export type PasswordResetTokenUnknownError = {
  kind: "PasswordResetTokenUnknownError";
};

export type PasswordResetTokenVerified = {
  kind: "PasswordResetTokenVerified";
  userId: number;
  email: string;
  fullName: string;
};

export type PurgedExpiredTokens = {
  kind: "PurgedExpiredTokens";
};

export function makePasswordResetStep2RequestFromInput(
  input: PasswordResetStep2Input
): PasswordResetStep2Request | PasswordResetTokenError | PasswordError {
  const {token, newPassword} = input;
  const tokenValidationResult = validateWithRules(token, PasswordResetTokenValidationRules);

  if (tokenValidationResult.kind === "Invalid") {
    return {
      kind: "PasswordResetTokenError",
      errorCode: tokenValidationResult.validationErrorCode,
    };
  }

  const newPasswordValidationResult = validateWithRules(newPassword, PasswordValidationRules);

  if (newPasswordValidationResult.kind === "Invalid") {
    return {
      kind: "PasswordError",
      errorCode: newPasswordValidationResult.validationErrorCode,
    };
  }

  return {
    kind: "PasswordResetStep2Request",
    token: tokenValidationResult.value,
    newPassword: newPasswordValidationResult.value,
  };
}
