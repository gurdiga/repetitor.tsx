import {runQuery, RowSet} from "backend/src/Utils/Db";

export async function getTokenForEmail(email: string): Promise<string> {
  const {rows} = (await runQuery({
    sql: `
          SELECT token
          FROM passsword_reset_tokens
          LEFT JOIN users ON passsword_reset_tokens.user_id = users.id
          WHERE users.email = ?
          `,
    params: [email],
  })) as RowSet;

  return rows[0] && rows[0].token;
}
