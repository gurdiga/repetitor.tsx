import * as debug from "debug";
import * as mysql from "mysql";
import {requireEnvVar} from "Utils/Env";

interface DataRow {
  [fieldName: string]: any;
}

export interface Result {
  rows: DataRow[];
}

interface ParametrizedQuery {
  sql: string;
  params: any[];
}

// This is exported only for use in tests.
export const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: requireEnvVar("APP_DB_HOST"),
  user: requireEnvVar("APP_DB_USER"),
  password: requireEnvVar("APP_DB_PASSWORD"),
  database: requireEnvVar("APP_DB_NAME"),
});

export function runQuery(query: ParametrizedQuery): Promise<Result> {
  const log = debug(`app:runQuery`);

  log({query});

  return new Promise<Result>((resolve, reject) => {
    connectionPool.query({sql: query.sql, values: query.params, timeout: 20000}, function(error, rows, _fields) {
      if (error) {
        reject(error);
      } else {
        resolve({rows: rows as DataRow[]});
      }
    });
  });
}
