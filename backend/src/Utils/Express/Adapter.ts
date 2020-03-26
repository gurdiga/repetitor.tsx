import {isTestEnvironment, requireEnvVar} from "backend/src/Utils/Env";
import {AppRoot} from "backend/src/Utils/Express/AppRoot";
import {PageBundleFilePaths, PagePathNames, RequireModulePaths} from "backend/src/Utils/Express/PagePaths";
import {VendorModulesWebPaths, VersionedVendorModulePaths} from "backend/src/Utils/Express/VendorModules";
import {logError} from "backend/src/Utils/Logging";
import {runScenario} from "backend/src/Utils/ScenarioRunner";
import * as express from "express";
import * as path from "path";
import {UserSession} from "shared/src/Model/UserSession";
import {pagePropsFromSession} from "shared/src/Utils/PageProps";

type HttpRequest = Pick<express.Request, "path" | "body" | "csrfToken" | "session">;
type HttpResponse = Pick<express.Response, "json" | "status" | "sendFile" | "sendStatus" | "send" | "set">;

export async function handlePost(req: HttpRequest, res: HttpResponse): Promise<void> {
  const {scenarioName, scenarioInput} = req.body;

  try {
    res.json(await runScenario(scenarioName, scenarioInput, req.session));
  } catch (error) {
    logError(`Error on runScenario`, {scenarioName}, error);
    res.status(500).json({error: "SCENARIO_EXECUTION_ERROR"});
  }
}

const cacheForever = {maxAge: "1000 days"};

export function sendVendorModule(fileName: string, res: HttpResponse): void {
  const vendorModuleFilePath = VersionedVendorModulePaths[fileName];

  if (vendorModuleFilePath) {
    res.sendFile(vendorModuleFilePath, cacheForever);
  } else {
    res.sendStatus(404);
  }
}

export function sendPageBundle(pagePathName: string | undefined, res: HttpResponse): void {
  // Home page’s bundle
  if (pagePathName === undefined) {
    pagePathName = "home";
  }

  if (PagePathNames.includes(pagePathName)) {
    res.sendFile(PageBundleFilePaths[pagePathName], cacheForever);
  } else {
    res.sendStatus(404);
  }
}

const VERSION = requireEnvVar("HEROKU_SLUG_COMMIT");
export const SharedBundles = [`/frontend/shared/bundle-${VERSION}.js`, `/shared/bundle-${VERSION}.js`];

export function sendSharedBundle(pathName: string, res: HttpResponse): void {
  if (SharedBundles.includes(pathName)) {
    const bundleDir = path.dirname(pathName);
    const bundleFilePath = `${AppRoot}/${bundleDir}/build/bundle.js`;

    res.sendFile(bundleFilePath, cacheForever);
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

export function sendPageHtml(req: HttpRequest, res: HttpResponse): void {
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

export function sendSecurityTxt(_req: HttpRequest, res: HttpResponse): void {
  res.set({"Content-Type": "text/plain"}).send(
    `# If you found any security issue, please let me know.
Contact: mailto:gurdiga@gmail.com`
  );
}
