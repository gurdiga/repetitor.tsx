import {RegistrationFormDTO} from "shared/Scenarios/UserRegistration";
import {assertPresent, ensureValid, makeAssertLengthBetween} from "shared/Utils/Assertions";

export interface User {
  fullName: string;
  email: string;
  password: string;
}

export const userFullNameAssertions = [assertPresent, makeAssertLengthBetween(5, 50)];
export const userEmailAssertions = [assertPresent, makeAssertLengthBetween(6, 50)];
export const userPasswordAssertions = [assertPresent, makeAssertLengthBetween(0, 100)];

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
