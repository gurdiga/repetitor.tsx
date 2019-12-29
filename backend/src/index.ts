import * as express from "express";
import {handleActionRequest} from "App/Backend";

express()
  .use(express.json())
  .post("/", (req, res) => {
    const {actionName, actionParams = {}} = req.body;

    res.type("json");

    handleActionRequest(actionName, actionParams)
      .then(result => res.send(JSON.stringify(result)))
      .catch(error => res.status(500).send(JSON.stringify({error: error.message})));
  })
  .listen(process.env.BACKEND_HTTP_PORT);
