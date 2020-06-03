import * as fs from "fs";

const PagesRoot = "frontend/pages";

export const PagePathNames = fs
  .readdirSync(PagesRoot, {withFileTypes: true})
  .filter((d) => d.isDirectory())
  .map((f) => f.name);

export const PageBundleFilePaths = Object.fromEntries(
  PagePathNames.map((pagePathName) => [pagePathName, `${PagesRoot}/${pagePathName}/build/bundle.js`])
);

export const RequireModulePaths = Object.fromEntries(
  PagePathNames.map((pagePathName) => [pagePathName, `${PagesRoot}/${pagePathName}/src/Main`])
);
