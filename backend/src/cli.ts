import {handleActionRequest} from "App/Backend";

const request = JSON.parse(process.argv[2]);
const {actionName, actionParams = {}} = request;

handleActionRequest({actionName, actionParams})
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  });
