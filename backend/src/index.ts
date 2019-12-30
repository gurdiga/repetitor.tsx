import * as express from "express";
import {handleActionRequest} from "App/Backend";

express()
  .use(express.json())
  .post("/", async (req, res) => {
    const {actionName, actionParams = {}} = req.body;

    try {
      const result = await handleActionRequest(actionName, actionParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  })
  .listen(process.env.BACKEND_HTTP_PORT);
