import {Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Backend} from "App/Backend";

const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event, context) => {
  const httpMethod = event.httpMethod.toUpperCase();
  const action = event.path;
  const params = event.multiValueQueryStringParameters!;

  try {
    return await Backend.executeAction({httpMethod, action, params}).then(result => ({
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
  const event = {
    httpMethod: "GET",
    path: "/",
    multiValueQueryStringParameters: null,
  };
  const context = {};
  const callback = () => null;

  handler((event as any) as APIGatewayProxyEvent, (context as any) as Context, callback);
}
