import {User} from "shared/Domain/User";
import {getStorablePassword} from "src/App/Actions/RegisterUser";
import {runQuery} from "src/App/Db";

export async function createUser(user: User): Promise<void> {
  const {email, password, fullName} = user;
  const {salt, passwordHash} = getStorablePassword(password);

  await runQuery({
    sql: `
        INSERT INTO users(email, password_hash, password_salt, full_name)
        VALUES(?, ?, ?, ?)
      `,
    params: [email, passwordHash, salt, fullName],
  });

  // TODO: Finish this: return the result, {error: DB_ERROR}, or {success: true};
}
