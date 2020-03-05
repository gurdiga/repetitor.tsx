import * as mysql from "mysql";
import {requireEnvVar} from "Utils/Env";
import {logError} from "Utils/Logging";

export interface DataRow {
  [fieldName: string]: any;
}

type Result = RowSet | InsertResult;

export interface RowSet {
  rows: DataRow[];
}

export interface InsertResult {
  insertId: number;
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
    connectionPool.query({sql: query.sql, values: query.params, timeout: 20000}, function(error, result, _fields) {
      if (error) {
        logError(error);
        reject(error);
      } else {
        if ("insertId" in result) {
          resolve({insertId: result.insertId});
        } else {
          resolve({rows: result as DataRow[]});
        }
      }
    });
  });
}
