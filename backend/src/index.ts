import * as express from "express";
import * as morgan from "morgan";
import * as cors from "cors";
import * as assert from "assert";

import {handleActionRequest} from "App/Backend";

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use(cors())
  .post("/", async (req, res) => {
    const {actionName, actionParams = {}} = req.body;

    console.log({actionName, actionParams});

    try {
      assert(!!actionName, "actionName is required");

      const result = await handleActionRequest(actionName, actionParams);

      res.json(result);
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  })
  .listen(process.env.BACKEND_HTTP_PORT);
