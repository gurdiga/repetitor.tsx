import {UserRegistrationDTO} from "shared/Scenarios/UserRegistration";
import {PredicateFn, UserValue, validateWithRules, ValidationMessages} from "shared/Utils/Validation";
import {DataProps} from "shared/Model/Utils";

export interface User {
  kind: "User";
  fullName: string;
  email: string;
  password: string;
}

export type UserPropName = keyof DataProps<User>;

export const UserFullNameValidationRules: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  TOO_SHORT: (text: UserValue) => !!text && text.trim().length >= 5,
  TOO_LONG: (text: UserValue) => !!text && text.trim().length <= 50,
};

export const UserEmailValidationRules: Record<EmailValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  INCORRECT: (text: UserValue) => {
    // TODO: extract function isSyntacticallyCorrectEmail
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

export const emailErrorMessages: ValidationMessages<typeof UserEmailValidationRules> = {
  REQUIRED: "Adresa de email lipsește",
  INCORRECT: "Adresa de email este invalidă",
};

export const UserPasswordValidationRules: Record<PasswordValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
};

export const passwordErrorMessages: ValidationMessages<typeof UserPasswordValidationRules> = {
  REQUIRED: "Parola lipsește",
};

export type UserPropError = FullNameError | EmailError | PasswordError;

type FullNameError = {
  kind: "FullNameError";
  errorCode: FullNameValidationErrorCode;
};

export type FullNameValidationErrorCode = "REQUIRED" | "TOO_SHORT" | "TOO_LONG";

export type EmailError = {
  kind: "EmailError";
  errorCode: EmailValidationErrorCode;
};

export type EmailValidationErrorCode = "REQUIRED" | "INCORRECT";

export type PasswordError = {
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
  const fullNameValidationResult = validateWithRules(registrationFormDTO.fullName, UserValidationRules.fullName);

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

const UserValidationRules: Record<UserPropName, Record<any, PredicateFn>> = {
  fullName: UserFullNameValidationRules,
  email: UserEmailValidationRules,
  password: UserPasswordValidationRules,
};
