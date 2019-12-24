import * as express from "express";
import {handleActionRequest} from "App/Backend";

const app = express();

app.get("/", async (req, res) => {
  const {actionName, actionParams = {}} = req.query;

  // TODO: add try/catch
  await handleActionRequest({actionName, actionParams}).then(result => {
    res.send(JSON.stringify(result));
  });
});

app.listen(process.env.BACKEND_HTTP_PORT);
