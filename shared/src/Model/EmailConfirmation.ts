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

export interface EmailConfirmationTokenMissingError {
  kind: "EmailConfirmationTokenMissingError";
}

export interface EmailConfirmationTokenUnrecognizedError {
  kind: "EmailConfirmationTokenUnrecognizedError";
}

export const EmailConfirmationTokenValidationRules: Record<"REQUIRED", PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const EmailConfirmationTokenErrorMessages: ValidationMessages<typeof EmailConfirmationTokenValidationRules> = {
  REQUIRED: "Tokenul de confirmare lipsește",
};

export function makeEmailConfirmationRequestFromInput(
  input: EmailConfirmationInput
): EmailConfirmationRequest | EmailConfirmationTokenMissingError {
  const {token} = input;
  const tokenValidationResult = validateWithRules(token, EmailConfirmationTokenValidationRules);

  if (tokenValidationResult.kind === "Invalid") {
    return {
      kind: "EmailConfirmationTokenMissingError",
    };
  }

  return {
    kind: "EmailConfirmationRequest",
    token: tokenValidationResult.value,
  };
}
