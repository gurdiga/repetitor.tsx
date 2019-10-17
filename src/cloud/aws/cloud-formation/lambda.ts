import {Lambda, ApiGateway, S3, IAM} from "cloudform";
import {Code} from "cloudform-types/types/lambda/function";

export namespace TestLambda {
  export const FunctionName = "testLambda";

  export const ApiEndpoint = new ApiGateway.RestApi({
    Name: "testApi",
    Description: "Just checking params.",
  });

  export const S3Bucket = new S3.Bucket({
    BucketName: "gurdiga-lambda-code",
    VersioningConfiguration: {Status: "Enabled"},
    AccessControl: "PublicRead",
  });

  export namespace Policies {
    export const XRayTracing = new IAM.Policy({
      PolicyName: "LambdaXRayTracing",
      PolicyDocument: {
        Statement: {
          Statement: {
            Effect: "Allow",
            Action: ["xray:PutTraceSegments", "xray:PutTelemetryRecords"],
            Resource: "*",
          },
        },
      },
    });

    export const Logging = new IAM.Policy({
      PolicyName: "LambdaLogging",
      PolicyDocument: {
        Effect: "Allow",
        Action: ["logs:CreateLogStream", "logs:PutLogEvents", "logs:CreateLogGroup"],
        Resource: "*",
      },
    });
  }

  export namespace Roles {
    export const LambdaExecuter = new IAM.Role({
      Description: "A role to use with Lambda functions",
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
    });
  }
}

export const FunctionCode = new Lambda.Function({
  FunctionName: TestLambda.FunctionName,
  Handler: "index.handler",
  Role: "arn:aws:iam::750527397320:role/service-role/test-lambda-role-p619ela7",
  Runtime: "nodejs10.x",
  /**
   This double type assertion is necessary because `cloudform` doesn’t seem to
   support string `Code` property values which is required by `aws
   cloudformation package` command.
   */
  Code: ("./src/cloud/aws/lambda/test-lambda/" as any) as Code,
});
