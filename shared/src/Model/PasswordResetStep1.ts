import {PasswordResetStep1Input} from "shared/src/Scenarios/PasswordResetStep1";
import {validateWithRules} from "shared/src/Utils/Validation";
import {EmailValidationRules, EmailError} from "shared/src/Model/Email";
import {DataProps} from "shared/src/Model/Utils";

export interface PasswordResetStep1 {
  kind: "TutorPasswordResetRequest"; // TODO: rename to TutorPasswordResetStep1
  email: string;
}

export type PasswordResetStep1PropName = keyof DataProps<PasswordResetStep1>;

export interface PasswordResetEmailSent {
  kind: "TutorPasswordResetEmailSent";
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
    kind: "TutorPasswordResetRequest",
    email: emailValidationResult.value,
  };
}
