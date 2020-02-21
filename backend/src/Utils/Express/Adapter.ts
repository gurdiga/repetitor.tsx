import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import {UserSession} from "shared/Model/UserSession";
import {isTestEnvironment} from "Utils/Env";
import {logError} from "Utils/Logging";
import {runScenario} from "Utils/ScenarioRunner";

const AppRoot = path.join(__dirname, "../../../..");
const FrontendPath = `${AppRoot}/frontend`;
const RelativePagesRoot = "frontend/pages";
const PagesRoot = `${AppRoot}/${RelativePagesRoot}`;

type HttpRequest = Pick<express.Request, "path" | "body" | "csrfToken" | "session">;
type HttpResponse = Pick<express.Response, "json" | "status" | "sendFile" | "sendStatus" | "send" | "set">;

export async function handlePost(req: HttpRequest, res: HttpResponse): Promise<void> {
  const {scenarioName, dto} = req.body;

  try {
    res.json(await runScenario(scenarioName, dto, req.session));
  } catch (error) {
    logError(`Error on runScenario`, {scenarioName}, error);
    res.status(500).json({error: "SCENARIO_EXECUTION_ERROR"});
  }
}

export const VENDOR_MODULE_PREFIX = "/vendor_modules/";

const frontendNodeModulesPath = `${FrontendPath}/node_modules`;
const vendorBundlePaths: Record<string, string> = {
  react: `${frontendNodeModulesPath}/react/umd/react.production.min.js`,
  "react-dom": `${frontendNodeModulesPath}/react-dom/umd/react-dom.production.min.js`,
  typestyle: `${frontendNodeModulesPath}/typestyle/umd/typestyle.min.js`,
  csx: `${frontendNodeModulesPath}/csx/umd/csx.min.js`,
  csstips: `${frontendNodeModulesPath}/csstips/umd/csstips.min.js`,
  requirejs: `${frontendNodeModulesPath}/requirejs/require.js`,
};
const vendorBundleNames = Object.keys(vendorBundlePaths);
const frontendDependencies = JSON.parse(fs.readFileSync(`${FrontendPath}/package-lock.json`, "utf8")).dependencies;
const vendorBundleVersions = vendorBundleNames.reduce((acc, bundleName) => {
  acc[bundleName] = frontendDependencies[bundleName].version;
  return acc;
}, {} as Record<string, string>);

export const requireJsPathsForVendorBundles = vendorBundleNames.reduce((acc, bundleName) => {
  acc[bundleName] = `${VENDOR_MODULE_PREFIX}${bundleName}-${vendorBundleVersions[bundleName]}`;
  return acc;
}, {} as Record<string, string>);

export const versionedVendorBundlePaths = vendorBundleNames.reduce((acc, bundleName) => {
  acc[`${bundleName}-${vendorBundleVersions[bundleName]}.js`] = vendorBundlePaths[bundleName];
  return acc;
}, {} as Record<string, string>);

export function sendVendorModule(vendorModuleFileName: string, res: HttpResponse): void {
  const vendorModuleFilePath = versionedVendorBundlePaths[vendorModuleFileName];

  if (vendorModuleFilePath) {
    res.sendFile(vendorModuleFilePath);
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

  const pageBundleFilePath = `${PagesRoot}/${pagePathName}/build/bundle.js`;

  if (PagePathNames.includes(pagePathName)) {
    res.sendFile(pageBundleFilePath);
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
</head>
<body>
  <div id="root"></div>
  <script src="REQUIREJS_BUNDLE"></script>
  <script>
    requirejs.config({
      paths: VENDOR_BUNDLES
    });

    requirejs(["bundle"], function() {
      requirejs(["MAIN_MODULE_PATH"], function(page) {
        page.main(PAGE_PROPS);
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
    const html = htmlTemplate
      .replace("REQUIREJS_BUNDLE", `${requireJsPathsForVendorBundles["requirejs"]}.js`)
      .replace("VENDOR_BUNDLES", JSON.stringify(requireJsPathsForVendorBundles, null, "  "))
      .replace("MAIN_MODULE_PATH", requireModulePath)
      .replace("CSRF_TOKEN", req.csrfToken())
      .replace("PAGE_PROPS", JSON.stringify({isAuthenticated: Boolean(session.userId)}, null, "  "));

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
