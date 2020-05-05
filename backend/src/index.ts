import {requireNumericEnvVar} from "backend/src/Env";
import {errorLoggingMiddleware} from "backend/src/ErrorLogging";
import {
  handlePost,
  sendPageBundle,
  sendPageHtml,
  sendSecurityTxt,
  sendSharedBundle,
  sendVendorModule,
  SharedBundles,
} from "backend/src/Express/Adapter";
import {session} from "backend/src/Express/Session";
import {uploadParser} from "backend/src/Express/UploadParsers";
import {VENDOR_MODULE_PREFIX} from "backend/src/Express/VendorModules";
import * as compression from "compression";
import * as cors from "cors";
import * as csurf from "csurf";
import * as express from "express";
import * as helmet from "helmet";

const csrfProtection = csurf();

// exported for tests
export const app = express()
  .set("trust proxy", true)
  .use(errorLoggingMiddleware)
  .use(helmet())
  .use(session)
  .use(compression())
  .use(express.json())
  .use(cors())
  .get("/googlefc7b36d4439b3ef2.html", (_req, res) => {
    res.send("google-site-verification: googlefc7b36d4439b3ef2.html");
  })
  .get("/.well-known/security.txt", sendSecurityTxt)
  .get(`${VENDOR_MODULE_PREFIX}:vendorModuleFileName`, (req, res) => {
    sendVendorModule(req.params.vendorModuleFileName, res);
  })
  .get(SharedBundles, (req, res) => {
    sendSharedBundle(req.path, res);
  })
  .get("/:pagePathName/bundle-*.js", (req, res) => {
    sendPageBundle(req.params.pagePathName, res);
  })
  .get("*", csrfProtection, sendPageHtml)
  .post("/", csrfProtection, uploadParser, handlePost);

app.listen(requireNumericEnvVar("PORT")).on("error", (error) => {
  console.error(error);
  process.exit(1);
});
