import * as assert from "assert";
import {handleActionRequest} from "App/Backend";

const cliArgument = process.argv[2];

assert(!!cliArgument, "Please pass in actionName and actionParams as JSON as the first argument.");

const request = JSON.parse(cliArgument);
const {actionName, actionParams = {}} = request;

handleActionRequest({actionName, actionParams}).then(result => {
  console.log(result);
});
