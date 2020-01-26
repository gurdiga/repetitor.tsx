import {RegistrationFormDTO} from "shared/Scenarios/UserRegistration";
import {assertPresent, ensureValid, makeAssertLengthBetween, ValidationError} from "shared/Utils/Assertions";
import {PredicateFn} from "shared/Validation";

export interface User {
  fullName: string;
  email: string;
  password: string;
}

export const userFullNameAssertions = [assertPresent, makeAssertLengthBetween(5, 50)];
export const userEmailAssertions = [assertPresent, makeAssertLengthBetween(6, 50)];
export const userPasswordAssertions = [assertPresent, makeAssertLengthBetween(0, 100)];

export type UserResult = Success | PropError | ModelError | DbError | UnexpectedError;

type PropError = FullNameError | EmailError | PasswordError;

type Success = {
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

type DbError = {
  kind: "DbError";
  errorCode: DbValidationErrorCode;
};

export type DbValidationErrorCode = "ERROR";

type ModelError = {
  kind: "ModelError";
  errorCode: ModelValidationErrorCode;
};

export type ModelValidationErrorCode = "EMAIL_TAKEN";

type UnexpectedError = {
  kind: "UnexpectedError";
  errorCode: string;
};

export function makeUserFromRegistrationFormDTO(registrationFormDTO: RegistrationFormDTO): User {
  const fullName = ensureValid<string>(registrationFormDTO.fullName, "fullName", userFullNameAssertions);
  const email = ensureValid<string>(registrationFormDTO.email, "email", userEmailAssertions);
  const password = ensureValid<string>(registrationFormDTO.password, "password", userPasswordAssertions);

  return {
    fullName,
    email,
    password,
  };
}

const fullNameVR: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: string) => text.trim().length > 0,
  TOO_SHORT: (text: string) => text.trim().length >= 5,
  TOO_LONG: (text: string) => text.trim().length <= 50,
};

const emailVR: Record<EmailValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: string) => text.trim().length > 0,
  INCORRECT: (text: string) => {
    // TODO: extract function syntacticallyCorrectEmail
    text = text.trim();

    const keyCharacters = [".", "@"];
    const containsKeyCharacters = keyCharacters.every(c => text.includes(c));

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
  REQUIRED: (text: string) => text.trim().length > 0,
};

export const UserValidationRules = {
  fullName: fullNameVR,
  email: emailVR,
  password: passwordVR,
};
