import * as MySQL from "mysql";
import {assertEnvVars} from "App/Utils";

export let connection: MySQL.Connection;

export interface Data {
  rows: any[];
}

interface ParametrizedQuery {
  sql: string;
  params: any[];
}

export function runQuery(query: ParametrizedQuery): Promise<Data> {
  assertEnvVars(["APP_DB_HOST", "APP_DB_USER", "APP_DB_PASSWORD", "APP_DB_NAME"]);

  return new Promise<Data>((resolve, reject) => {
    if (!connection || connection.state !== "connected") {
      connection = MySQL.createConnection({
        host: process.env.APP_DB_HOST,
        user: process.env.APP_DB_USER,
        password: process.env.APP_DB_PASSWORD,
        database: process.env.APP_DB_NAME,
      });

      connection.connect();
    }

    connection.query({sql: query.sql, values: query.params, timeout: 20000}, function(error, rows, fields) {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve({rows});
      }

      connection.end();
    });
  });
}
