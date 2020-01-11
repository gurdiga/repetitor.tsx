import * as cors from "cors";
import * as compression from "compression";
import * as express from "express";
import * as morgan from "morgan";
import * as helmet from "helmet";
import {handlePost, HttpPort, sendPageBundle, sendPageHtml, sendVendorModule} from "./App/ExpressAdapter";

express()
  .use(helmet())
  .use(morgan("tiny"))
  .use(compression())
  .use(express.json())
  .use(cors())
  .get("/umd_node_modules/:vendorModuleFileName", (req, res) => {
    sendVendorModule(req.params.vendorModuleFileName, res);
  })
  .get(["/bundle.js", "/:pagePathName/bundle.js"], (req, res) => {
    sendPageBundle(req.params.pagePathName, res);
  })
  .get("*", sendPageHtml)
  .post("/", handlePost)
  .listen(HttpPort, "localhost");
