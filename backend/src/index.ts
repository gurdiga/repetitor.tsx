import * as express from "express";
import * as morgan from "morgan";
import {handleActionRequest} from "App/Backend";

express()
  .use(express.json())
  .use(morgan("tiny"))
  .post("/", async (req, res) => {
    const {actionName, actionParams = {}} = req.body;

    console.log({actionName, actionParams});

    try {
      const result = await handleActionRequest(actionName, actionParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  })
  .listen(process.env.BACKEND_HTTP_PORT);
