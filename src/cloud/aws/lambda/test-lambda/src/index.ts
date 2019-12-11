import {Handler, APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import * as MySQL from "mysql";

let connection: MySQL.Connection;

const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event, context) => {
  return new Promise<APIGatewayProxyResult>((resolve, reject) => {
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
    connection.query({sql: "SELECT 1 + 1 AS solution", values: [], timeout: 20000}, function(error, results, fields) {
      console.timeEnd("MySQL query");

      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      resolve({
        statusCode: 200,
        body: JSON.stringify({APP_RESULT: results[0].solution}),
      });
    });
  }).catch(e => {
    throw e;
  });
};

exports.handler = handler;
