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
    httpMethod: string;
    actionName: string;
    params: {[name: string]: string[]};
  }

  interface ActionDefinition {
    assertValidParams: (params: ActionRequest["params"]) => void; // Throws unless params are valid
    action: () => Data;
  }

  const ActionRegistry: {[actionKey: string]: ActionDefinition} = {
    "POST RegisterUser": {
      assertValidParams: params => {
        throw new ApplicationError("paramValidation for POST RegisterUser is not yet implemented");
      },
      action: () => ({
        rows: ["TODO"],
      }),
    },
    "GET testAction": {
      assertValidParams: params => null,
      action: () => ({rows: ["OK"]}),
    },
  };

  export function handleActionRequest(actionRequest: ActionRequest): Promise<Data> {
    const action = getActionForRequest(actionRequest);

    action.assertValidParams(actionRequest.params);

    return executeAction(action);
  }

  function getActionForRequest({httpMethod, actionName}: ActionRequest): ActionDefinition {
    const actionKey = `${httpMethod.toUpperCase()} ${actionName}`;
    const action = ActionRegistry[actionKey];

    assert(!!action, `Could not find action for request: ${actionKey}`);

    return action;
  }

  function executeAction(action: ActionDefinition): Promise<Data> {
    if (action) {
      // TODO: Implement
      return Promise.resolve({rows: []});
    }

    const query = {} as ParametrizedQuery;

    return runQuery(query);
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
    const missingVars = varNames.filter(name => !process.env[name]).join(", ");

    assert(missingVars.length === 0, `Env vars are missing: ${missingVars}`);
  }
}
