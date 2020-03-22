import {runQuery, RowSet} from "backend/src/Utils/Db";

export async function getTokenForEmail(email: string): Promise<string> {
  const {rows} = (await runQuery({
    sql: `
          SELECT passsword_reset_tokens.token
          FROM users
          LEFT JOIN passsword_reset_tokens ON passsword_reset_tokens.user_id = users.id
          WHERE users.email = ?
          `,
    params: [email],
  })) as RowSet;

  return rows[0] && rows[0].token;
}
