import {PageRendering} from "frontend/shared/PageRendering";
import {HomePage} from "HomePage";
import {PageProps} from "shared/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(HomePage, pageProps);
}
