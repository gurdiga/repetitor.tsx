import {SystemError} from "shared/Model/Utils";
import {EmailError} from "shared/Model/Email";
import {PasswordError} from "shared/Model/Password";
import {LoginCheckSuccess, LoginCheckError} from "shared/Model/LoginCheck";

export interface TutorLoginInput {
  email?: string;
  password?: string;
}

type InputError = EmailError | PasswordError;

export type TutorLoginResult = LoginCheckSuccess | InputError | LoginCheckError | SystemError;
