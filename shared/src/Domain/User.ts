import {RegistrationFormDTO} from "shared/Scenarios/UserRegistration";
import {assertPresent, ensureValid, makeAssertLengthBetween, ValidationError} from "shared/Utils/Assertions";

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
