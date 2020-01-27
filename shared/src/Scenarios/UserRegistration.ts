import {UserResult} from "shared/Domain/User";

export type UserRegistrationScenarioHandler = (params: RegistrationFormDTO) => Promise<UserResult>;

export interface RegistrationFormDTO {
  fullName?: string;
  email?: string;
  password?: string;
}
