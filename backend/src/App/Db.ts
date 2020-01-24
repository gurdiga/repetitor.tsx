import * as debug from "debug";
import * as mysql from "mysql";
import {assertEnvVars} from "App/Utils";

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

assertEnvVars(["APP_DB_HOST", "APP_DB_USER", "APP_DB_PASSWORD", "APP_DB_NAME"]);

// This is exported only for use in tests.
export const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.APP_DB_HOST,
  user: process.env.APP_DB_USER,
  password: process.env.APP_DB_PASSWORD,
  database: process.env.APP_DB_NAME,
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
