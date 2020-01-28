import {UserRegistrationDTO} from "shared/Scenarios/UserRegistration";
import {PredicateFn, UserValue, validateWithRules} from "shared/Utils/Validation";

export interface User {
  kind: "User";
  fullName: string;
  email: string;
  password: string;
}

export type UserPropError = FullNameError | EmailError | PasswordError;

export type Success = {
  kind: "Success";
};

type FullNameError = {
  kind: "FullNameError";
  errorCode: FullNameValidationErrorCode;
};

export type FullNameValidationErrorCode = "REQUIRED" | "TOO_SHORT" | "TOO_LONG";

type EmailError = {
  kind: "EmailError";
  errorCode: EmailValidationErrorCode;
};

export type EmailValidationErrorCode = "REQUIRED" | "INCORRECT";

type PasswordError = {
  kind: "PasswordError";
  errorCode: PasswordValidationErrorCode;
};

export type PasswordValidationErrorCode = "REQUIRED";

export type UserModelError = {
  kind: "ModelError";
  errorCode: UserModelValidationErrorCode;
};

export type UserModelValidationErrorCode = "EMAIL_TAKEN";

export function makeUserFromRegistrationFormDTO(
  registrationFormDTO: UserRegistrationDTO
): User | UserPropError | UserModelError {
  let fullNameValidationResult = validateWithRules(registrationFormDTO.fullName, UserValidationRules.fullName);

  if (fullNameValidationResult.kind === "Invalid") {
    return {kind: "FullNameError", errorCode: fullNameValidationResult.validationErrorCode};
  }

  const emailValidationResult = validateWithRules(registrationFormDTO.email, UserValidationRules.email);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  const passwordValidationResult = validateWithRules(registrationFormDTO.password, UserValidationRules.password);

  if (passwordValidationResult.kind === "Invalid") {
    return {kind: "PasswordError", errorCode: passwordValidationResult.validationErrorCode};
  }

  return {
    kind: "User",
    fullName: fullNameValidationResult.value,
    email: emailValidationResult.value,
    password: passwordValidationResult.value,
  };
}

const fullNameVR: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  TOO_SHORT: (text: UserValue) => !!text && text.trim().length >= 5,
  TOO_LONG: (text: UserValue) => !!text && text.trim().length <= 50,
};

const emailVR: Record<EmailValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  INCORRECT: (text: UserValue) => {
    // TODO: extract function syntacticallyCorrectEmail
    if (!text) {
      return false;
    }

    text = text.trim();

    const keyCharacters = [".", "@"];
    const containsKeyCharacters = keyCharacters.every(c => !!text && text.includes(c));

    if (!containsKeyCharacters) {
      return false;
    }

    const sides = text.split("@");
    const [login, domain] = sides.map(s => s.trim());

    const doesLoginLookReasonable = login.length >= 2 && /[a-z0-9]+/i.test(login);

    if (!doesLoginLookReasonable) {
      return false;
    }

    const domainLevels = domain.split(/\./).reverse();
    const doDomainPartsLookReasonable = /[a-z]{2,}/i.test(domainLevels[0]) && domainLevels.every(l => l.length >= 1);

    if (!doDomainPartsLookReasonable) {
      return false;
    }

    return true;
  },
};

const passwordVR: Record<PasswordValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const UserValidationRules = {
  fullName: fullNameVR,
  email: emailVR,
  password: passwordVR,
};
