import {Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Backend} from "App/Backend";

const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event, context) => {
  try {
    const httpMethod = event.httpMethod;
    const actionName = event.queryStringParameters?.["actionName"] || "MISSING_ACTION_NAME";
    const params = event.multiValueQueryStringParameters || {};

    return await Backend.handleActionRequest({httpMethod, actionName, params}).then(result => ({
      statusCode: 200,
      body: JSON.stringify(result),
    }));
  } catch (e) {
    console.error(e);

    return {
      statusCode: 500,
      body: JSON.stringify({error: e.message}),
    };
  }
};

exports.handler = handler;

// This is to be able to run it locally with Node.
if (require.main === module) {
  const stdin = require("fs")
    .readFileSync(0)
    .toString();
  const stdinJson = JSON.parse(stdin);

  const event = (stdinJson as any) as APIGatewayProxyEvent;
  const context = ({} as any) as Context;
  const callback = () => null;

  (handler(event, context, callback) as Promise<any>).then(console.log);
}
