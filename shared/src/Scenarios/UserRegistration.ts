import {UserResult} from "shared/Domain/User";

export type UserRegistrationHandler = (params: UserRegistrationDTO) => Promise<UserResult>;

export interface UserRegistrationDTO {
  fullName?: string;
  email?: string;
  password?: string;
}
