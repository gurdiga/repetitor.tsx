import * as assert from "assert";
import {ActionDefinition, ActionParams} from "App/ActionDefinition";
import {genRandomString, hashString} from "App/Utils/StringUtils";
import {runQuery} from "App/DB";

interface Params extends ActionParams {
  email: string;
  password: string;
}

export const RegisterUser: ActionDefinition<Params> = {
  assertValidParams: params => {
    const {email, password} = params;

    assert(email, "Email is required");
    assert(password, "Password is required");
  },
  execute: params => {
    const {password, email} = params;
    const {salt, passwordHash} = getStorablePassword(password);

    return runQuery({
      sql: `
        INSERT INTO users(email, password_hash, password_salt)
        VALUES(?, ?, ?)
      `,
      params: [email, passwordHash, salt],
    });
  },
};

interface StorablePassword {
  salt: string;
  passwordHash: string;
}

function getStorablePassword(password: string): StorablePassword {
  const salt = genRandomString(100);
  const passwordHash = hashString(password, salt);

  return {salt, passwordHash};
}
