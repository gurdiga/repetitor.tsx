import {EmailError, EmailValidationRules} from "shared/src/Model/Email";
import {DataProps} from "shared/src/Model/Utils";
import {PasswordResetStep1Input} from "shared/src/Scenarios/PasswordResetStep1";
import {validateWithRules} from "shared/src/Utils/Validation";

export interface PasswordResetStep1 {
  kind: "PasswordResetRequest"; // TODO: rename to TutorPasswordResetStep1
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
    kind: "PasswordResetRequest",
    email: emailValidationResult.value,
  };
}
