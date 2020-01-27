import debug from "debug";
import {ActionRegistry} from "shared/ActionRegistry";
import {RegistrationFormDTO} from "shared/Scenarios/UserRegistration";
import {validateWithRules} from "shared/Validation";
import {UserValidationRules} from "shared/Domain/User";
import {runQuery} from "src/App/Db";
import {genRandomString, hashString} from "src/App/Utils/StringUtils";

type Params = ActionRegistry["RegisterUser"]["Params"];
type Response = ActionRegistry["RegisterUser"]["Response"];

const log = debug("app:RegisterUser");

export async function RegisterUser(params: RegistrationFormDTO): Promise<Response> {
  const {fullName, email, password} = params;

  let fullNameValidationResult = validateWithRules(fullName, UserValidationRules.fullName);

  if (fullNameValidationResult.kind === "Invalid") {
    return {kind: "FullNameError", errorCode: fullNameValidationResult.validationErrorCode};
  }

  const emailValidationResult = validateWithRules(email, UserValidationRules.email);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  const passwordValidationResult = validateWithRules(password, UserValidationRules.password);

  if (passwordValidationResult.kind === "Invalid") {
    return {kind: "PasswordError", errorCode: passwordValidationResult.validationErrorCode};
  }

  const {salt, passwordHash} = getStorablePassword(passwordValidationResult.value); // TODO: Change the ValidationResult type to prevent this.

  try {
    await runQuery({
      sql: `
            INSERT INTO users(email, password_hash, password_salt, full_name)
            VALUES(?, ?, ?, ?)
          `,
      params: [email, passwordHash, salt, fullName],
    });

    return {kind: "Success"};
  } catch (error) {
    switch (error.code) {
      case "ER_DUP_ENTRY":
        return {kind: "ModelError", errorCode: "EMAIL_TAKEN"};
      default:
        log({error});
        return {kind: "DbError", errorCode: "ERROR"};
    }
  }
}

interface StorablePassword {
  salt: string;
  passwordHash: string;
}

export function getStorablePassword(password: string): StorablePassword {
  const salt = genRandomString(100);
  const passwordHash = hashString(password, salt);

  return {salt, passwordHash};
}
