import * as MySQL from "mysql";
import {APIGatewayProxyEvent} from "aws-lambda";

exports.handler = async (event: APIGatewayProxyEvent) => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify({"MySQL exports": Object.keys(MySQL)}),
  };

  return response;
};
