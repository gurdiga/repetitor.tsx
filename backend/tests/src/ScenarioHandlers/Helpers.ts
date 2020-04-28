import {q} from "backend/tests/src/TestHelpers";

export async function getPasswordResetTokenForEmail(email: string): Promise<string> {
  const [row] = await q(`
    SELECT passsword_reset_tokens.token
    FROM users
    LEFT JOIN passsword_reset_tokens ON passsword_reset_tokens.user_id = users.id
    WHERE users.email = "${email}"
  `);

  return row?.token;
}
