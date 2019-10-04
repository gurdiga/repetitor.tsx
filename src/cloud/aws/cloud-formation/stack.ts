import cloudform, {ApiGateway, StringParameter} from "cloudform";

// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html
// https://github.com/bright/cloudform
export default cloudform({
  Description: "My test cloud formation.",
  Parameters: {
    DeployEnv: new StringParameter({
      Description: "Deploy environment name",
      AllowedValues: ["stage", "production"],
    }),
  },
  Resources: {
    testApi: new ApiGateway.RestApi({
      Name: "testApi",
      Description: "Just checking params.",
    }),
  },
});
