import {PredicateFn, UserValue, ValidationMessages} from "shared/src/Utils/Validation";

export type PasswordError = {
  kind: "PasswordError";
  errorCode: PasswordValidationErrorCode;
};

export type PasswordValidationErrorCode = "REQUIRED";

export const PasswordValidationRules: Record<PasswordValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const PasswordErrorMessages: ValidationMessages<typeof PasswordValidationRules> = {
  REQUIRED: "Parola lipsește",
};
