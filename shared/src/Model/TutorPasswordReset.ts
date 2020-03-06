import {TutorPasswordResetInput} from "shared/Scenarios/TutorPasswordReset";
import {validateWithRules} from "shared/Utils/Validation";
import {UserEmailValidationRules, EmailError} from "shared/Model/Email";
import {DataProps} from "shared/Model/Utils";

export interface TutorPasswordReset {
  kind: "TutorPasswordReset";
  email: string;
}

export type TutorPasswordResetPropName = keyof DataProps<TutorPasswordReset>;

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

export function makeTutorPasswordResetFromInput(input: TutorPasswordResetInput): TutorPasswordReset | EmailError {
  const emailValidationResult = validateWithRules(input.email, UserEmailValidationRules);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  return {
    kind: "TutorPasswordReset",
    email: emailValidationResult.value,
  };
}
