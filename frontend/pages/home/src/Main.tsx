import {PageProps} from "shared/src/Utils/PageProps";
import {HomePage} from "frontend/pages/home/src/HomePage";
import {PageRendering} from "frontend/shared/src/PageRendering";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(HomePage, pageProps);
}
