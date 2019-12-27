import * as express from "express";
import {handleActionRequest} from "App/Backend";

express()
  .use(express.json())
  .post("/", async (req, res) => {
    const {actionName, actionParams = {}} = req.body;

    res.type("json");

    try {
      await handleActionRequest({actionName, actionParams}).then(result => {
        res.send(JSON.stringify(result));
      });
    } catch (e) {
      res.status(500).send(JSON.stringify({error: e.message}));
    }
  })
  .listen(process.env.BACKEND_HTTP_PORT);
