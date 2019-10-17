import cloudform, {StringParameter, Template} from "cloudform";
import {TestLambda} from "./lambda";
import * as PackagedLambdaStack from "./lambda-stack-packaged.json";

// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html
// https://github.com/bright/cloudform

const testLambdaCode = (PackagedLambdaStack as Template).Resources![TestLambda.FunctionName];

export default cloudform({
  Description: "My test cloud formation.",
  Parameters: {
    DeployEnv: new StringParameter({
      Description: "Deploy environment name (just testing?)",
      AllowedValues: ["stage", "production"],
    }),
  },
  Resources: {
    testLambdaCode,
    testLambdaApiEndpoint: TestLambda.ApiEndpoint,
    testLambdaS3bucket: TestLambda.S3Bucket,
    testLambdaExecuter: TestLambda.Roles.LambdaExecuter,
  },
});
