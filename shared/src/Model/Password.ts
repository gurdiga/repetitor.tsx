import {PredicateFn, UserValue, ValidationMessages} from "shared/Utils/Validation";

export type PasswordError = {
  kind: "PasswordError";
  errorCode: PasswordValidationErrorCode;
};

export type PasswordValidationErrorCode = "REQUIRED";

export const UserPasswordValidationRules: Record<PasswordValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const passwordErrorMessages: ValidationMessages<typeof UserPasswordValidationRules> = {
  REQUIRED: "Parola lipsește",
};
