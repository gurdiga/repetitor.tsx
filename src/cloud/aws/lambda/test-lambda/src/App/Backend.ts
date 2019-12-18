import * as MySQL from "mysql";

interface Data {
  rows: any[];
}

interface ParametrizedQuery {
  sql: string;
  params: any[];
}

let connection: MySQL.Connection;

interface Action {
  httpMethod: string;
  action: string;
  params: {[name: string]: string[]};
}

const ActionRegistry = new Map<Action, ParametrizedQuery>();

ActionRegistry.set(
  {
    httpMethod: "GET",
    action: "sum",
    params: {},
  },
  {
    sql: "SELECT 1+1 AS sum",
    params: [],
  }
);

export namespace Backend {
  export function executeAction(action: Action): Promise<Data> {
    const query = ActionRegistry.get(action);

    if (!query) {
      throw new Error(`Could not find query for this action: ${JSON.stringify(action)}`);
    }

    return runQuery(query);
  }
}

function runQuery(query: ParametrizedQuery): Promise<Data> {
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
