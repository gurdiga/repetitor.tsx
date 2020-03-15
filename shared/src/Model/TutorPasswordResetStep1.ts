import {TutorPasswordResetStep1Input} from "shared/Scenarios/TutorPasswordResetStep1";
import {validateWithRules} from "shared/Utils/Validation";
import {UserEmailValidationRules, EmailError} from "shared/Model/Email";
import {DataProps} from "shared/Model/Utils";

export interface TutorPasswordResetStep1 {
  kind: "TutorPasswordResetRequest"; // TODO: rename to TutorPasswordResetStep1
  email: string;
}

export type TutorPasswordResetStep1PropName = keyof DataProps<TutorPasswordResetStep1>;

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
): TutorPasswordResetStep1 | EmailError {
  const emailValidationResult = validateWithRules(input.email, UserEmailValidationRules);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  return {
    kind: "TutorPasswordResetRequest",
    email: emailValidationResult.value,
  };
}
