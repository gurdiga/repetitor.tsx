import cloudform from "cloudform";
import {FunctionCode} from "./lambda";

export default cloudform({
  Resources: {
    testFunction: FunctionCode,
  },
});
