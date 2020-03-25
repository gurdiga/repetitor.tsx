import {EmailConfirmationInput} from "shared/src/Scenarios/EmailConfirmation";
import {PredicateFn, UserValue, validateWithRules, ValidationMessages} from "shared/src/Utils/Validation";

export interface EmailConfirmed {
  kind: "EmailConfirmed";
  userId: number;
  email: string;
}

export interface EmailConfirmationRequest {
  kind: "EmailConfirmationRequest";
  token: string;
}

export interface EmailConfirmationTokenValidationError {
  kind: "EmailConfirmationTokenValidationError";
  errorCode: EmailConfirmationTokenValidationErrorCode;
}

export interface EmailConfirmationTokenUnrecognizedError {
  kind: "EmailConfirmationTokenUnrecognizedError";
}

export type EmailConfirmationTokenValidationErrorCode = "REQUIRED";

export const EmailConfirmationTokenValidationRules: Record<EmailConfirmationTokenValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const EmailConfirmationTokenErrorMessages: ValidationMessages<typeof EmailConfirmationTokenValidationRules> = {
  REQUIRED: "Tokenul de confirmare lipsește",
};

export function makeEmailConfirmationRequestFromInput(
  input: EmailConfirmationInput
): EmailConfirmationRequest | EmailConfirmationTokenValidationError {
  const {token} = input;
  const tokenValidationResult = validateWithRules(token, EmailConfirmationTokenValidationRules);

  if (tokenValidationResult.kind === "Invalid") {
    return {
      kind: "EmailConfirmationTokenValidationError",
      errorCode: tokenValidationResult.validationErrorCode,
    };
  }

  return {
    kind: "EmailConfirmationRequest",
    token: tokenValidationResult.value,
  };
}
