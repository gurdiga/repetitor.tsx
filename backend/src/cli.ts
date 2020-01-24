import {handleActionRequest} from "App/Backend";
import {connectionPool} from "App/Db";

const request = JSON.parse(process.argv[2]);
const {actionName, actionParams = {}} = request;

handleActionRequest(actionName, actionParams)
  .then(console.log)
  .catch(console.error)
  .finally(connectionPool.end);
