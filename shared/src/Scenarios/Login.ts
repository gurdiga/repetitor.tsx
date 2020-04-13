import {SystemError} from "shared/src/Model/Utils";
import {EmailError} from "shared/src/Model/Email";
import {PasswordError} from "shared/src/Model/Password";
import {LoginCheckSuccess, LoginCheckError} from "shared/src/Model/LoginCheck";

export interface LoginInput {
  email: string | undefined;
  password: string | undefined;
}

export type LoginResult = LoginCheckSuccess | EmailError | PasswordError | LoginCheckError | SystemError;
