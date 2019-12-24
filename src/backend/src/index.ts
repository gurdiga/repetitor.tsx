import * as express from "express";
import {handleActionRequest} from "App/Backend";

const app = express();

app.get("/", async (req, res) => {
  const {actionName, actionParams = {}} = req.query;

  res.type("json");

  try {
    await handleActionRequest({actionName, actionParams}).then(result => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    res.status(500).send(JSON.stringify({error: e.message}));
  }
});

app.listen(process.env.BACKEND_HTTP_PORT);
