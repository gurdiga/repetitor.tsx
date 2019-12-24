import * as assert from "assert";
import * as MySQL from "mysql";
import {ApplicationError} from "App/ApplicationError";

export namespace Backend {
  interface Data {
    rows: any[];
  }

  interface ParametrizedQuery {
    sql: string;
    params: any[];
  }

  let connection: MySQL.Connection;

  interface ActionRequest {
    actionName: string;
    actionParams: {[name: string]: string[]};
  }

  interface ActionDefinition {
    assertValidParams: (params: ActionRequest["actionParams"]) => void; // Throws unless params are valid
    execute: () => Promise<Data>;
  }

  const ActionRegistry: {[actionKey: string]: ActionDefinition} = {
    RegisterUser: {
      assertValidParams: params => {
        throw new ApplicationError("Param validation for RegisterUser is not yet implemented");
      },
      execute: () => Promise.resolve({rows: ["TODO"]}),
    },
    TestAction: {
      assertValidParams: params => null,
      execute: () =>
        runQuery({
          sql: "SELECT 1 + 1",
          params: [],
        }),
    },
  };

  export function handleActionRequest(actionRequest: ActionRequest): Promise<Data> {
    const action = getActionForRequest(actionRequest);

    action.assertValidParams(actionRequest.actionParams);

    return action.execute();
  }

  function getActionForRequest({actionName}: ActionRequest): ActionDefinition {
    const action = ActionRegistry[actionName];

    assert(!!action, `Could not find action for request: ${actionName}`);

    return action;
  }

  function runQuery(query: ParametrizedQuery): Promise<Data> {
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

  function assertEnvVars(varNames: string[]) {
    const missingVars = varNames.filter(name => !(name in process.env)).join(", ");

    assert(missingVars.length === 0, `Env vars are missing: ${missingVars}`);
  }
}
