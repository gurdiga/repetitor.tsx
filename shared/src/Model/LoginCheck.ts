import {DataProps} from "shared/src/Model/Utils";
import {TutorLoginInput} from "shared/src/Scenarios/TutorLogin";
import {EmailError, EmailValidationRules} from "shared/src/Model/Email";
import {PasswordError, PasswordValidationRules} from "shared/src/Model/Password";
import {validateWithRules, PredicateFn} from "shared/src/Utils/Validation";
import {UserSession} from "shared/src/Model/UserSession";

export interface LoginCheck {
  kind: "LoginCheck";
  email: string;
  password: string;
}

export type LoginCheckPropName = keyof DataProps<LoginCheck>;

export type LoginCheckSuccess = {
  kind: "LoginCheckSuccess";
};

export type LoginCheckInfo = {
  kind: "LoginCheckInfo";
  userId: UserSession["userId"];
};

export type LoginCheckError = UnknownEmailError | IncorrectPasswordError;

export type UnknownEmailError = {
  kind: "UnknownEmailError";
};

export type IncorrectPasswordError = {
  kind: "IncorrectPasswordError";
};

export type LoginCheckPropError = EmailError | PasswordError;

export function makeLoginCkeckFromLoginInput(input: TutorLoginInput): LoginCheck | LoginCheckPropError {
  const emailValidationResult = validateWithRules(input.email, LoginCheckValidationRules.email);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  const passwordValidationResult = validateWithRules(input.password, LoginCheckValidationRules.password);

  if (passwordValidationResult.kind === "Invalid") {
    return {kind: "PasswordError", errorCode: passwordValidationResult.validationErrorCode};
  }

  return {
    kind: "LoginCheck",
    email: emailValidationResult.value,
    password: passwordValidationResult.value,
  };
}

const LoginCheckValidationRules: Record<LoginCheckPropName, Record<any, PredicateFn>> = {
  email: EmailValidationRules,
  password: PasswordValidationRules,
};
