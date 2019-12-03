// import * as MySQL from "mysql";
import {APIGatewayProxyEvent} from "aws-lambda";

exports.handler = async (event: APIGatewayProxyEvent) => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify({ENV: process.env}),
  };

  return response;
};
