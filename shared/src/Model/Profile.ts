import {ProfileUpdateInput} from "shared/src/Scenarios/ProfileUpdate";
import {validateWithRules} from "shared/src/Utils/Validation";
import {UserValidationRules, FullNameError} from "shared/src/Model/Account";

// Reference: https://beta.workflowy.com/#/8634d2e2a7e4
export type ProfileLoaded = {
  kind: "ProfileLoaded";
  fullName: string;
  email: string;
  photo: Link;
  resume: MarkdownDocument;
  isPublished: boolean;
};

export type ProfileUpdated = {
  kind: "ProfileUpdated";
};

export type NotAuthenticatedError = {
  kind: "NotAuthenticatedError";
};

export type ProfileNotFoundError = {
  kind: "ProfileNotFoundError";
};

type Link = {
  kind: "Link";
  value: string;
};

type MarkdownDocument = {
  kind: "MarkdownDocument";
  value: string;
};

type ProfileUpdateRequest = {
  kind: "ProfileUpdateRequest";
  fullName: string;
};

export function makeProfileUpdateRequestFromInput(input: ProfileUpdateInput): ProfileUpdateRequest | FullNameError {
  const fullNameValidationResult = validateWithRules(input.fullName, UserValidationRules.fullName);

  if (fullNameValidationResult.kind === "Invalid") {
    return {kind: "FullNameError", errorCode: fullNameValidationResult.validationErrorCode};
  }

  return {
    kind: "ProfileUpdateRequest",
    fullName: fullNameValidationResult.value,
  };
}
