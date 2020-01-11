import * as assert from "assert";
import debug from "debug";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import {handleActionRequest} from "./Backend";
import {assertEnvVars} from "./Utils";

export const HttpPort = getPortNumber();

const AppRoot = path.join(__dirname, "../../..");
const RelativePagesRoot = "frontend/pages";
const PagesRoot = `${AppRoot}/${RelativePagesRoot}`;

type HttpRequest = Pick<express.Request, "path" | "body">;
type HttpResponse = Pick<express.Response, "json" | "status" | "sendFile" | "sendStatus" | "send">;

const log = debug(`app:ExpressAdapter`);

export async function handlePost(req: HttpRequest, res: HttpResponse): Promise<void> {
  const {actionName, actionParams = {}} = req.body;

  try {
    const result = await handleActionRequest(actionName, actionParams);

    res.json(result);
    log(`Handled action ${actionName}`);
  } catch (error) {
    log(`Failed to handle action ${actionName}: ${error}`);

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
    log(`Sent vendor module: ${vendorModuleFileName}`);
  } else {
    res.sendStatus(404);
  }
}

const PagePathNames = getPagePathNames(PagesRoot);

export function sendPageBundle(pagePathName: string | undefined, res: HttpResponse): void {
  // Home page’s bundle
  if (!pagePathName) {
    pagePathName = "home";
  }

  const pageBundleFilePath = `${PagesRoot}/${pagePathName}/build/bundle.js`;

  if (PagePathNames.includes(pagePathName)) {
    res.sendFile(pageBundleFilePath);
    log(`Sent page bundle: ${pageBundleFilePath}`);
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
    const html = htmlTemplate.replace("MAIN_MODULE_PATH", requireModulePath);

    res.send(html);
    log(`Sent page HTML for ${pagePathName}`);
  } else {
    res.sendStatus(404);
  }
}

function getPagePathNames(pagesRoot: string): string[] {
  return fs
    .readdirSync(pagesRoot, {withFileTypes: true})
    .filter(d => d.isDirectory())
    .map(f => f.name);
}

function getPortNumber(): number {
  assertEnvVars(["BACKEND_HTTP_PORT"]);

  const portNumber = parseInt(process.env.BACKEND_HTTP_PORT!, 10);

  assert(!isNaN(portNumber), `Invalid variable value for BACKEND_HTTP_PORT: ${portNumber}`);

  return portNumber;
}
