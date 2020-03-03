import {TutorPasswordRecoveryInput} from "shared/Scenarios/TutorPasswordRecovery";
import {validateWithRules} from "shared/Utils/Validation";
import {UserEmailValidationRules, EmailError} from "shared/Model/Email";
import {DataProps} from "shared/Model/Utils";

export interface TutorPasswordRecovery {
  kind: "TutorPasswordRecovery";
  email: string;
}

export type TutorPasswordRecoveryPropName = keyof DataProps<TutorPasswordRecovery>;

export interface TutorPasswordRecoveryEmailSent {
  kind: "TutorPasswordRecoveryEmailSent";
}

export type EmailExists = {
  kind: "EmailExists";
  userId: number;
  fullName: string;
};

export type RecoveryToken = {
  kind: "RecoveryToken";
  token: string;
};

export function makeTutorPasswordRecoveryFromInput(
  input: TutorPasswordRecoveryInput
): TutorPasswordRecovery | EmailError {
  const emailValidationResult = validateWithRules(input.email, UserEmailValidationRules);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  return {
    kind: "TutorPasswordRecovery",
    email: emailValidationResult.value,
  };
}
