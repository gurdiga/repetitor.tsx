import * as fs from "fs";
import {AppRoot} from "backend/src/Utils/Express/AppRoot";

export const VENDOR_MODULE_PREFIX = "/vendor_modules/";

const FrontendNodeModulesPath = `${AppRoot}/frontend/node_modules`;
const FrontendDependencies = JSON.parse(fs.readFileSync(`${AppRoot}/frontend/package-lock.json`, "utf8")).dependencies;

interface VendorModule {
  importName: string;
  modulePath: string;
  version: string;
  webPath: string;
}

const VendorModules = Object.entries({
  react: `${FrontendNodeModulesPath}/react/umd/react.production.min.js`,
  "react-dom": `${FrontendNodeModulesPath}/react-dom/umd/react-dom.production.min.js`,
  typestyle: `${FrontendNodeModulesPath}/typestyle/umd/typestyle.min.js`,
  csx: `${FrontendNodeModulesPath}/csx/umd/csx.min.js`,
  csstips: `${FrontendNodeModulesPath}/csstips/umd/csstips.min.js`,
  requirejs: `${FrontendNodeModulesPath}/requirejs/require.js`,
  rollbar: `${FrontendNodeModulesPath}/rollbar/dist/rollbar.umd.min.js`,
}).map(([importName, modulePath]) => makeVendorModule(importName, modulePath));

export const VendorModulesWebPaths = Object.fromEntries(
  VendorModules.map(({importName, webPath}) => [importName, webPath])
);

export const VersionedVendorModulePaths = Object.fromEntries(
  VendorModules.map(({importName, version, modulePath}) => [`${importName}-${version}.js`, modulePath])
);

function makeVendorModule(importName: string, modulePath: string): VendorModule {
  const version = FrontendDependencies[importName].version;
  const webPath = `${VENDOR_MODULE_PREFIX}${importName}-${version}`;

  return {
    importName,
    modulePath,
    version,
    webPath,
  };
}
