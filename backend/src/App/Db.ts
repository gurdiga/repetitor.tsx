import * as MySQL from "mysql";
import {Data} from "App/Backend";
import {assertEnvVars} from "App/Utils";

let connection: MySQL.Connection;

interface ParametrizedQuery {
  sql: string;
  params: any[];
}

export function runQuery(query: ParametrizedQuery): Promise<Data> {
  assertEnvVars(["APP_DB_HOST", "APP_DB_USER", "APP_DB_PASSWORD", "APP_DB_NAME"]);

  return new Promise<Data>((resolve, reject) => {
    if (!connection) {
      console.time("MySQL connection");

      connection = MySQL.createConnection({
        host: process.env.APP_DB_HOST,
        user: process.env.APP_DB_USER,
        password: process.env.APP_DB_PASSWORD,
        database: process.env.APP_DB_NAME,
      });

      connection.connect();
      console.timeEnd("MySQL connection");
    }

    console.time("MySQL query");
    connection.query({sql: query.sql, values: query.params, timeout: 20000}, function(error, results, fields) {
      console.timeEnd("MySQL query");

      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      resolve({rows: results[0]});
    });
  });
}
