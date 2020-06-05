import {FullNameError, UserValidationRules} from "shared/src/Model/Account";
import {ProfileUpdateInput} from "shared/src/Scenarios/ProfileUpdate";
import {validateWithRules} from "shared/src/Utils/Validation";

// Reference: https://beta.workflowy.com/#/8634d2e2a7e4
export type ProfileLoaded = {
  kind: "ProfileLoaded";
  fullName: string;
  email: string;
  resume: MarkdownDocument;
  isPublished: boolean;
  avatarFilename: string | null;
};

export type ClientSideProfile = {
  kind: "ClientSideProfile";
  fullName: string;
  email: string;
  resume: MarkdownDocument;
  isPublished: boolean;
  avatarUrl: string | null;
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

export type Link = {
  kind: "Link";
  value: string;
};

export type MarkdownDocument = {
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

export function makeLink(input: string): Link | undefined {
  try {
    const url = new URL(input);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return {
        kind: "Link",
        value: url.toString(),
      };
    }
  } catch (error) {
    // What can I do? 🤷🏻‍♂️
  }

  return undefined;
}
