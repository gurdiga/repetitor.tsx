import * as cors from "cors";
import * as compression from "compression";
import * as express from "express";
import * as morgan from "morgan";
import * as helmet from "helmet";
import * as csurf from "csurf";
import {handlePost, sendPageBundle, sendPageHtml, sendVendorModule, sendSecurityTxt} from "Utils/Express/Adapter";
import {session} from "Utils/Express/Session";
import {requireNumericEnvVar} from "Utils/Env";

const csrfProtection = csurf();

express()
  .set("trust proxy", true)
  .use(helmet())
  .use(morgan("tiny"))
  .use(session)
  .use(compression())
  .use(express.json())
  .use(cors())
  .get("/.well-known/security.txt", sendSecurityTxt)
  .get("/umd_node_modules/:vendorModuleFileName", (req, res) => {
    sendVendorModule(req.params.vendorModuleFileName, res);
  })
  .get(["/bundle.js", "/:pagePathName/bundle.js"], (req, res) => {
    sendPageBundle(req.params.pagePathName, res);
  })
  .get("*", csrfProtection, sendPageHtml)
  .post("/", csrfProtection, handlePost)
  .listen(requireNumericEnvVar("BACKEND_HTTP_PORT"), "localhost");
