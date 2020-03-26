import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import {UserSession} from "shared/src/Model/UserSession";
import {isTestEnvironment, requireEnvVar} from "backend/src/Utils/Env";
import {logError} from "backend/src/Utils/Logging";
import {runScenario} from "backend/src/Utils/ScenarioRunner";
import {pagePropsFromSession} from "shared/src/Utils/PageProps";

const AppRoot = path.join(__dirname, "../../../..");
const RelativePagesRoot = "frontend/pages";
const PagesRoot = `${AppRoot}/${RelativePagesRoot}`;

type HttpRequest = Pick<express.Request, "path" | "body" | "csrfToken" | "session">;
type HttpResponse = Pick<express.Response, "json" | "status" | "sendFile" | "sendStatus" | "send" | "set" | "redirect">;

export async function handlePost(req: HttpRequest, res: HttpResponse): Promise<void> {
  const {scenarioName, scenarioInput} = req.body;

  try {
    res.json(await runScenario(scenarioName, scenarioInput, req.session));
  } catch (error) {
    logError(`Error on runScenario`, {scenarioName}, error);
    res.status(500).json({error: "SCENARIO_EXECUTION_ERROR"});
  }
}

const frontendNodeModulesPath = `${AppRoot}/frontend/node_modules`;
const vendorModulePaths: Record<string, string> = {
  react: `${frontendNodeModulesPath}/react/umd/react.production.min.js`,
  "react-dom": `${frontendNodeModulesPath}/react-dom/umd/react-dom.production.min.js`,
  typestyle: `${frontendNodeModulesPath}/typestyle/umd/typestyle.min.js`,
  csx: `${frontendNodeModulesPath}/csx/umd/csx.min.js`,
  csstips: `${frontendNodeModulesPath}/csstips/umd/csstips.min.js`,
  requirejs: `${frontendNodeModulesPath}/requirejs/require.js`,
  rollbar: `${frontendNodeModulesPath}/rollbar/dist/rollbar.umd.min.js`,
};
const vendorModuleNames = Object.keys(vendorModulePaths);
const frontendDependencies = JSON.parse(fs.readFileSync(`${AppRoot}/frontend/package-lock.json`, "utf8")).dependencies;
const vendorModuleVersions = vendorModuleNames.reduce((acc, moduleName) => {
  acc[moduleName] = frontendDependencies[moduleName].version;
  return acc;
}, {} as Record<string, string>);

export const VENDOR_MODULE_PREFIX = "/vendor_modules/";
export const webPathsForVendorModules = vendorModuleNames.reduce((acc, moduleName) => {
  acc[moduleName] = `${VENDOR_MODULE_PREFIX}${moduleName}-${vendorModuleVersions[moduleName]}`;
  return acc;
}, {} as Record<string, string>);

export const versionedVendorModulePaths = vendorModuleNames.reduce((acc, moduleName) => {
  acc[`${moduleName}-${vendorModuleVersions[moduleName]}.js`] = vendorModulePaths[moduleName];
  return acc;
}, {} as Record<string, string>);

const cacheForever = {maxAge: "1000 days"};

export function sendVendorModule(vendorModuleFileName: string, res: HttpResponse): void {
  const vendorModuleFilePath = versionedVendorModulePaths[vendorModuleFileName];

  if (vendorModuleFilePath) {
    res.sendFile(vendorModuleFilePath, cacheForever);
  } else {
    res.sendStatus(404);
  }
}

const PagePathNames = getPagePathNames(PagesRoot);

export function sendPageBundle(pagePathName: string | undefined, res: HttpResponse): void {
  // Home page’s bundle
  if (pagePathName === undefined) {
    pagePathName = "home";
  }

  if (PagePathNames.includes(pagePathName)) {
    res.sendFile(`${PagesRoot}/${pagePathName}/build/bundle.js`, cacheForever);
  } else {
    res.sendStatus(404);
  }
}

const VERSION = requireEnvVar("HEROKU_SLUG_COMMIT");
export const SHARED_BUNDLES = [`/frontend/shared/bundle-${VERSION}.js`, `/shared/bundle-${VERSION}.js`];

export function sendSharedBundle(pathName: string, res: HttpResponse): void {
  if (SHARED_BUNDLES.includes(pathName)) {
    const dir = path.dirname(pathName);

    res.sendFile(`${AppRoot}/${dir}/build/bundle.js`, cacheForever);
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
  <script src="${webPathsForVendorModules["rollbar"]}.js"></script>
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
  <script src="${webPathsForVendorModules["requirejs"]}.js"></script>
  <script>
    requirejs.config({
      paths: ${JSON.stringify(webPathsForVendorModules, null, "  ")}
    });

    var sharedBundles = ${JSON.stringify(SHARED_BUNDLES)};
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
    const requireModulePath = `${RelativePagesRoot}/${pagePathName}/src/Main`;
    const session = (req.session as any) as UserSession;
    const pageProps = pagePropsFromSession(session);

    const html = htmlTemplate
      .replace("PAGE_PATH_NAME", pagePathName)
      .replace("MAIN_MODULE_PATH", requireModulePath)
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

function getPagePathNames(pagesRoot: string): string[] {
  return fs
    .readdirSync(pagesRoot, {withFileTypes: true})
    .filter(d => d.isDirectory())
    .map(f => f.name);
}
