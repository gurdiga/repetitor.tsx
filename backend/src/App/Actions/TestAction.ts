import {runQuery} from "App/DB";

interface Response {
  sum: number;
}

export async function TestAction(): Promise<Response> {
  const result = await runQuery({
    sql: "SELECT 1 + 1 AS sum",
    params: [],
  });

  const {sum} = result.rows[0];

  return {sum};
}
