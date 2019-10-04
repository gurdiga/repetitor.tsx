// Copy-and-pasted sample function from the AWS Lambda console.

exports.handler = async event => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
