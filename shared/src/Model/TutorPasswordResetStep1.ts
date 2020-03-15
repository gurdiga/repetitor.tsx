import {TutorPasswordResetStep1Input} from "shared/Scenarios/TutorPasswordResetStep1";
import {validateWithRules} from "shared/Utils/Validation";
import {UserEmailValidationRules, EmailError} from "shared/Model/Email";
import {DataProps} from "shared/Model/Utils";

export interface TutorPasswordResetRequest {
  kind: "TutorPasswordResetRequest";
  email: string;
}

export type TutorPasswordResetPropName = keyof DataProps<TutorPasswordResetRequest>;

export interface TutorPasswordResetEmailSent {
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

export function makeTutorPasswordResetRequestFromInput(
  input: TutorPasswordResetStep1Input
): TutorPasswordResetRequest | EmailError {
  const emailValidationResult = validateWithRules(input.email, UserEmailValidationRules);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  return {
    kind: "TutorPasswordResetRequest",
    email: emailValidationResult.value,
  };
}
