import {isDevelopmentEnvironment, isTestEnvironment, requireEnvVar} from "backend/src/Env";
import {logError} from "backend/src/ErrorLogging";
import {AppRoot} from "backend/src/Express/AppRoot";
import {PageBundleFilePaths, PagePathNames, RequireModulePaths} from "backend/src/Express/PagePaths";
import {uploadedFilesFromRequest} from "backend/src/Express/UploadParsers";
import {VendorModulesWebPaths, VersionedVendorModulePaths} from "backend/src/Express/VendorModules";
import {runScenario} from "backend/src/ScenarioRunner";
import {Request, Response} from "express";
import * as path from "path";
import {UserSession} from "shared/src/Model/UserSession";
import {pagePropsFromSession} from "shared/src/Utils/PageProps";

export async function handlePost(req: Request, res: Response): Promise<void> {
  const uploadedFiles = uploadedFilesFromRequest(req);
  const {scenarioName, scenarioInput} = req.body;

  try {
    res.json(await runScenario(scenarioName, scenarioInput, req.session, uploadedFiles));
  } catch (error) {
    logError(`Error on runScenario`, {scenarioName}, error);
    res.status(500).json({error: "SCENARIO_EXECUTION_ERROR"});
  }
}

const cacheParams = isDevelopmentEnvironment() ? {cacheControl: true} : {maxAge: "1000 days"};

export function sendVendorModule(fileName: string, res: Response): void {
  const vendorModuleFilePath = VersionedVendorModulePaths[fileName];

  // An exception.
  if (fileName === "rollbar.umd.min.js.map") {
    res.sendStatus(200);
    return;
  }

  if (vendorModuleFilePath) {
    res.sendFile(vendorModuleFilePath, cacheParams);
  } else {
    res.sendStatus(404);
  }
}

export function sendPageBundle(pagePathName: string, res: Response): void {
  if (PagePathNames.includes(pagePathName)) {
    res.sendFile(PageBundleFilePaths[pagePathName], cacheParams);
  } else {
    res.sendStatus(404);
  }
}

const VERSION = requireEnvVar("HEROKU_SLUG_COMMIT");
export const SharedBundles = [`/frontend/shared/bundle-${VERSION}.js`, `/shared/bundle-${VERSION}.js`];

export function sendSharedBundle(pathName: string, res: Response): void {
  if (SharedBundles.includes(pathName)) {
    const bundleDir = path.dirname(pathName);
    const bundleFilePath = `${AppRoot}/${bundleDir}/build/bundle.js`;

    res.sendFile(bundleFilePath, cacheParams);
  } else {
    res.sendStatus(404);
  }
}

const htmlTemplate = `<!DOCTYPE html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf_token" content="CSRF_TOKEN" />
  <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
  <title>Loading…</title>
  <script>
    var environment = "${requireEnvVar("NODE_ENV")}";
  </script>
  <script src="${VendorModulesWebPaths["rollbar"]}.js"></script>
  <script>
    rollbar.init({
      accessToken: "${requireEnvVar("APP_ROLLBAR_POST_CLIENT_ITEM_TOKEN")}",
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
          environment: "${requireEnvVar("NODE_ENV")}"
      }
    });
  </script>
</head>
<body>
  <div id="root"></div>
  <script src="${VendorModulesWebPaths["requirejs"]}.js"></script>
  <script>
    requirejs.config({
      paths: ${JSON.stringify(VendorModulesWebPaths, null, "  ")}
    });

    var sharedBundles = ${JSON.stringify(SharedBundles)};
    var pageBundle = "/PAGE_PATH_NAME/bundle-${VERSION}.js";
    var appBundles = sharedBundles.concat([pageBundle]);

    requirejs(appBundles, function() {
      requirejs(["MAIN_MODULE_PATH"], function(page) {
        page.main(PAGE_PROPS, location.search);
      });
    });
  </script>
</body>
`;

export function sendPageHtml(req: Request, res: Response): void {
  let pagePathName = req.path.replace(/^\/|\/$/g, ""); // strip the slashes on both ends

  if (pagePathName === "") {
    pagePathName = "home";
  }

  if (PagePathNames.includes(pagePathName)) {
    const session = (req.session as any) as UserSession;
    const pageProps = pagePropsFromSession(session);

    const html = htmlTemplate
      .replace("PAGE_PATH_NAME", pagePathName)
      .replace("MAIN_MODULE_PATH", RequireModulePaths[pagePathName])
      .replace("CSRF_TOKEN", req.csrfToken())
      .replace("PAGE_PROPS", JSON.stringify(pageProps, null, "  "));

    if (isTestEnvironment()) {
      // To use in tests.
      res.set("XSRF-TOKEN", req.csrfToken());
    }

    res.send(html);
  } else {
    res.sendStatus(404);
  }
}

export function sendSecurityTxt(_req: Request, res: Response): void {
  res.set({"Content-Type": "text/plain"}).send(
    `# If you found any security issue, please let me know.
Contact: mailto:gurdiga@gmail.com`
  );
}
