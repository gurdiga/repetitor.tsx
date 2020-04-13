import {PageRendering} from "frontend/shared/src/PageRendering";
import {LoginPage} from "frontend/pages/autentificare/src/LoginPage";
import {PageProps} from "shared/src/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(LoginPage, pageProps);
}
