import cloudform, {ApiGateway, StringParameter, S3} from "cloudform";

// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html
// https://github.com/bright/cloudform
export default cloudform({
  Description: "My test cloud formation.",
  Parameters: {
    DeployEnv: new StringParameter({
      Description: "Deploy environment name (testing)",
      AllowedValues: ["stage", "production"],
    }),
  },
  Resources: {
    testApi: new ApiGateway.RestApi({
      Name: "testApi",
      Description: "Just checking params.",
    }),
    lambdaS3: new S3.Bucket({
      BucketName: "gurdiga-lambda-code",
      AccessControl: "PublicRead",
    }),
    // testLambda: new Lambda.Function({
    //   FunctionName: "testLambda",
    //   Handler: "index.handler",
    //   Role: "arn:aws:iam::750527397320:role/service-role/test-lambda-role-p619ela7",
    //   Runtime: "nodejs10.x",
    //   Code: {
    //     ZipFile: "zipfile-value",
    //   },
    // }),
  },
});
