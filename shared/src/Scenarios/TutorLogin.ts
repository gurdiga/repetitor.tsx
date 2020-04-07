import {SystemError} from "shared/src/Model/Utils";
import {EmailError} from "shared/src/Model/Email";
import {PasswordError} from "shared/src/Model/Password";
import {LoginCheckSuccess, LoginCheckError} from "shared/src/Model/LoginCheck";

export interface TutorLoginInput {
  email: string | undefined;
  password: string | undefined;
}

export type TutorLoginResult = LoginCheckSuccess | EmailError | PasswordError | LoginCheckError | SystemError;
