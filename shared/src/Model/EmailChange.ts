import {validateWithRules, PredicateFn, UserValue, ValidationMessages} from "shared/src/Utils/Validation";
import {EmailValidationRules, EmailError} from "shared/src/Model/Email";
import {EmailChangeStep1Input} from "shared/src/Scenarios/EmailChangeStep1";
import {EmailChangeStep2Input} from "shared/src/Scenarios/EmailChangeStep2";

export type EmailChangeConfirmationRequestSent = {
  kind: "EmailChangeConfirmationRequestSent";
};

export type EmailChangeRequest = {
  kind: "EmailChangeRequest";
  newEmail: string;
  currentEmail: string;
};

export type RequestCreated = {
  kind: "RequestCreated";
  token: string;
};

export function makeEmailChangeRequest(
  input: EmailChangeStep1Input,
  currentEmail: string
): EmailChangeRequest | EmailError {
  const newEmailResult = validateWithRules(input.newEmail, EmailValidationRules);

  if (newEmailResult.kind === "Invalid") {
    return {
      kind: "EmailError",
      errorCode: newEmailResult.validationErrorCode,
    };
  }

  return {
    kind: "EmailChangeRequest",
    newEmail: newEmailResult.value,
    currentEmail,
  };
}

export type EmailChangeConfirmed = {
  kind: "EmailChangeConfirmed";
};

export type EmailChangeTokenValidationError = {
  kind: "EmailChangeTokenValidationError";
  errorCode: ChangeEmailTokenErrorCode;
};

export type EmailChangeTokenUnrecognizedError = {
  kind: "EmailChangeTokenUnrecognizedError";
};

export type EmailChangeConfirmation = {
  kind: "EmailChangeConfirmation";
  token: string;
};

export type EmailChangeTokenVerified = {
  kind: "EmailChangeTokenVerified";
  userId: number;
  newEmail: string;
  currentEmail: string;
};

export type ChangeEmailTokenErrorCode = "REQUIRED" | "BAD_LENGTH";

export const EMAIL_CHANGE_TOKEN_LENGTH = 16;

export const ChangeEmailTokenValidationRules: Record<ChangeEmailTokenErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  BAD_LENGTH: (text: UserValue) => !!text && text.trim().length === EMAIL_CHANGE_TOKEN_LENGTH,
};

export const ChangeEmailTokenErrorMessages: ValidationMessages<typeof ChangeEmailTokenValidationRules> = {
  REQUIRED: "Tokenul de schimbare a adresei de email lipsește",
  BAD_LENGTH: "Tokenul de schimbare a adresei de email a nu corespunde după lungime",
};

export function makeEmailChangeConfirmation(
  input: EmailChangeStep2Input
): EmailChangeConfirmation | EmailChangeTokenValidationError {
  const validationResult = validateWithRules(input.token, ChangeEmailTokenValidationRules);

  if (validationResult.kind === "Invalid") {
    return {
      kind: "EmailChangeTokenValidationError",
      errorCode: validationResult.validationErrorCode,
    };
  }

  return {
    kind: "EmailChangeConfirmation",
    token: validationResult.value,
  };
}
