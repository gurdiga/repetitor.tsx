import * as express from "express";
import * as morgan from "morgan";
import * as cors from "cors";
import * as ExpressAdapter from "./App/ExpressAdapter";

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use(cors())
  .get("/umd_node_modules/:vendorModuleFileName", (req, res) => {
    ExpressAdapter.sendVendorModule(req.params.vendorModuleFileName, res);
  })
  .get(["/bundle.js", "/:pagePathName/bundle.js"], (req, res) => {
    ExpressAdapter.sendPageBundle(req.params.pagePathName, res);
  })
  .get("*", ExpressAdapter.sendPageHtml)
  .post("/", ExpressAdapter.handlePost)
  .listen(ExpressAdapter.HttpPort, "localhost");
