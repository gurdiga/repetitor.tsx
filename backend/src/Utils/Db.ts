import * as mysql from "mysql";
import {requireEnvVar, isTestEnvironment} from "backend/src/Utils/Env";
import {logError} from "backend/src/Utils/Logging";

export interface DataRow {
  [fieldName: string]: any;
}

type Result = RowSet | StatementResult;

/**

Result received by connectionPool.query’s callback function:

result: [
  RowDataPacket {
    id: 14,
    email: 'gurdiga@gmail.com',
    password_hash: 'b8cdcf0a501abbc8e59433d9502231035da04420834d71634413d8e6670f8b95',
    password_salt: '6d522a8257863ea63af5827e3f8c08c05e32493db6521fcdddaf3a1e5f74bdc9db65fa77af72f13fb3ff03c0ba2c4bc47d8d',
    full_name: 'Vlad GURDIGA',
    email_confirmation_token: '67f76aa20d8c2a6c',
    is_email_confirmed: 1
  }
]
*/
export interface RowSet {
  rows: DataRow[];
}

/**

Result received by connectionPool.query’s callback function:

OkPacket {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: '(Rows matched: 1  Changed: 0  Warnings: 0',
  protocol41: true,
  changedRows: 0
}

"changedRows" differs from "affectedRows" in that it does not count updated rows
whose values were not changed.
https://www.npmjs.com/package/mysql#getting-the-number-of-affected-rows

*/
export interface StatementResult {
  insertId: number;
  affectedRows: number;
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
  return new Promise<Result>((resolve, reject) => {
    connectionPool.query({sql: query.sql, values: query.params, timeout: 20000}, function (error, result, _fields) {
      if (error) {
        logError(error);
        reject(error);
      } else {
        if (Array.isArray(result)) {
          resolve({rows: result as DataRow[]});
        } else {
          resolve(result as StatementResult);
        }
      }
    });
  });
}
