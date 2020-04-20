import * as fs from "fs";
import {AppRoot} from "backend/src/Utils/Express/AppRoot";

const RelativePagesRoot = "frontend/pages";
const PagesRoot = `${AppRoot}/${RelativePagesRoot}`;

export const PagePathNames = fs
  .readdirSync(PagesRoot, {withFileTypes: true})
  .filter((d) => d.isDirectory())
  .map((f) => f.name);

export const PageBundleFilePaths = Object.fromEntries(
  PagePathNames.map((pagePathName) => [pagePathName, `${PagesRoot}/${pagePathName}/build/bundle.js`])
);

export const RequireModulePaths = Object.fromEntries(
  PagePathNames.map((pagePathName) => [pagePathName, `${RelativePagesRoot}/${pagePathName}/src/Main`])
);
