import {isDevelopmentEnvironment, isTestEnvironment, requireEnvVar} from "backend/src/Env";
import {logError} from "backend/src/ErrorLogging";
import {AppRoot} from "backend/src/Express/AppRoot";
import {PageBundleFilePaths, PagePathNames, RequireModulePaths} from "backend/src/Express/PagePaths";
import {getUploadParsingResult} from "backend/src/Express/UploadParsing";
import {VendorModulesWebPaths, VersionedVendorModulePaths} from "backend/src/Express/VendorModules";
import {runScenario} from "backend/src/ScenarioRunner";
import {NextFunction, Request, Response} from "express";
import * as path from "path";
import {UserSession} from "shared/src/Model/UserSession";
import {isObject} from "shared/src/Utils/Language";
import {pagePropsFromSession} from "shared/src/Utils/PageProps";

export async function handlePost(req: Request, res: Response): Promise<void> {
  const {scenarioName} = req.body;

  try {
    const scenarioInput: object = getScenarioInput(req);

    try {
      res.json(await runScenario(scenarioName, scenarioInput, req.session));
    } catch (error) {
      logError(error, {scenarioName, context: "runScenario"});
      res.status(500).json({error: "SCENARIO_EXECUTION_ERROR"});
    }
  } catch (error) {
    logError(error, {scenarioName, context: "getScenarioInput"});
    res.status(500).json({error: "SCENARIO_INPUT_ERROR"});
  }
}

function getScenarioInput(req: Request): object {
  const isFormUpload = !!req.get("Content-Type")?.startsWith("multipart/form-data");

  if (isFormUpload) {
    const upload = getUploadParsingResult(req);
    const input = getScenarioInputFromForm(req);

    return {...input, upload};
  } else {
    // I assume it’s a JSON request.
    const {scenarioInput} = req.body;

    if (!isObject(scenarioInput)) {
      throw new Error("Scenario input is expected to be an object");
    }

    return scenarioInput;
  }
}

function getScenarioInputFromForm(req: Request): object {
  let input: object;

  try {
    input = JSON.parse(req.body.scenarioInput);
  } catch (error) {
    throw new Error("Unable to parse scenario input JSON");
  }

  const isObject = input !== null && input.constructor.name === "Object";

  if (isObject) {
    return input;
  } else {
    throw new Error("Scenario input is expected to be an object");
  }
}

const cacheParams = isDevelopmentEnvironment() ? {cacheControl: true} : {maxAge: "1000 days"};
const sendFileOptions = {
  root: AppRoot,
  ...cacheParams,
};

export function sendVendorModule(fileName: string, res: Response): void {
  const vendorModuleFilePath = VersionedVendorModulePaths[fileName];

  // An exception.
  if (fileName === "rollbar.umd.min.js.map") {
    res.sendStatus(200);
    return;
  }

  if (vendorModuleFilePath) {
    res.sendFile(vendorModuleFilePath, sendFileOptions);
  } else {
    res.sendStatus(404);
  }
}

export function sendPageBundle(pagePathName: string, res: Response): void {
  if (PagePathNames.includes(pagePathName)) {
    res.sendFile(PageBundleFilePaths[pagePathName], sendFileOptions);
  } else {
    res.sendStatus(404);
  }
}

const VERSION = requireEnvVar("HEROKU_SLUG_COMMIT");
export const SharedBundles = [`/frontend/shared/bundle-${VERSION}.js`, `/shared/bundle-${VERSION}.js`];

export function sendSharedBundle(pathName: string, res: Response): void {
  if (SharedBundles.includes(pathName)) {
    const bundleDir = path.dirname(pathName);
    const bundleFilePath = `${bundleDir}/build/bundle.js`;

    res.sendFile(bundleFilePath, sendFileOptions);
  } else {
    res.sendStatus(404);
  }
}

const htmlTemplate = `<!DOCTYPE html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf_token" content="CSRF_TOKEN" />
  <meta name="msvalidate.01" content="7349C399D4F768E25C7444A6204D3F13" />
  <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
  <title>Loading…</title>
  <link href="/fonts-${VERSION}.css" rel="stylesheet">
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

type ExpressHandler = (err: Error, req: Request, res: Response, next: NextFunction) => void;

// This function only exists to facilitate stubbing in integration tests for this adapter.
export function forwardTo<HF extends () => ExpressHandler>(handlerFactory: HF): ExpressHandler {
  return (...args: Parameters<ExpressHandler>): ReturnType<ExpressHandler> => handlerFactory()(...args);
}

export function sendCss(req: Request, res: Response): void {
  const fileName = path.basename(req.path).replace(`-${VERSION}`, "");

  switch (fileName) {
    case "fonts.css":
      return res.sendFile(`${FontsBasePath}/fonts.css`, sendFileOptions);
    default:
      res.sendStatus(404);
  }
}

const FontsBasePath = "frontend/shared/fonts";

export function sendFont(req: Request, res: Response): void {
  const fileName = path.basename(req.path);
  const filePath = path.join(FontsBasePath, fileName);

  res.sendFile(filePath, sendFileOptions);
}
