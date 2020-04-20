import {validateWithRules} from "shared/src/Utils/Validation"
import {EmailValidationRules, EmailError} from "shared/src/Model/Email"
import {EmailChangeStep1Input} from "shared/src/Scenarios/EmailChangeStep1"

export type EmailChangeConfirmationSent = {
  kind: "EmailChangeConfirmationSent";
}

export type EmailChangeRequest = {
  kind: "EmailChangeRequest";
  newEmail: string;
  currentEmail: string;
}

export type RequestCreated = {
  kind: "RequestCreated";
  token: string;
}

export function makeEmailChangeRequest(input: EmailChangeStep1Input, currentEmail: string): EmailChangeRequest | EmailError {
  const newEmailResult = validateWithRules(input.newEmail, EmailValidationRules);

  if (newEmailResult.kind === "Invalid") {
    return {
      kind: "EmailError",
      errorCode: newEmailResult.validationErrorCode
    };
  }

  return {
    "kind": "EmailChangeRequest",
    newEmail: newEmailResult.value,
    currentEmail
  }
}
