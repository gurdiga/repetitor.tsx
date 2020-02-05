import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import {runScenario} from "Utils/ScenarioRunner";

const AppRoot = path.join(__dirname, "../../../..");
const RelativePagesRoot = "frontend/pages";
const PagesRoot = `${AppRoot}/${RelativePagesRoot}`;

type HttpRequest = Pick<express.Request, "path" | "body" | "csrfToken">;
type HttpResponse = Pick<express.Response, "json" | "status" | "sendFile" | "sendStatus" | "send" | "set">;

export async function handlePost(req: HttpRequest, res: HttpResponse): Promise<void> {
  const {scenarioName, dto} = req.body;

  try {
    const result = await runScenario(scenarioName, dto);

    res.json({...result, csrfToken: req.csrfToken()});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error || "Error with no message";

    res.status(500).json({error: errorMessage});
  }
}

const FrontendNodeModulesPath = `${AppRoot}/frontend/node_modules`;
const VendorModules: Record<string, string> = {
  "react.production.min.js": `${FrontendNodeModulesPath}/react/umd/react.production.min.js`,
  "react-dom.production.min.js": `${FrontendNodeModulesPath}/react-dom/umd/react-dom.production.min.js`,
  "typestyle.min.js": `${FrontendNodeModulesPath}/typestyle/umd/typestyle.min.js`,
  "csx.min.js": `${FrontendNodeModulesPath}/csx/umd/csx.min.js`,
  "csstips.min.js": `${FrontendNodeModulesPath}/csstips/umd/csstips.min.js`,
  "require.min.js": `${FrontendNodeModulesPath}/requirejs/require.js`,
};

export function sendVendorModule(vendorModuleFileName: string, res: HttpResponse): void {
  const vendorModuleFilePath = VendorModules[vendorModuleFileName];

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

export function sendPageHtml(req: HttpRequest, res: HttpResponse): void {
  let pagePathName = req.path.replace(/^\/|\/$/g, ""); // strip the slashes on both ends

  if (pagePathName === "") {
    pagePathName = "home";
  }

  if (PagePathNames.includes(pagePathName)) {
    const htmlTemplate = fs.readFileSync(`${__dirname}/index.html`, "utf8");
    const requireModulePath = `${RelativePagesRoot}/${pagePathName}/src/Main`;
    const html = htmlTemplate.replace("MAIN_MODULE_PATH", requireModulePath).replace("CSRF_TOKEN", req.csrfToken());

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