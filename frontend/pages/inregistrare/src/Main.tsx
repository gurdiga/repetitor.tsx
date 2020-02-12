import {PageRendering} from "frontend/shared/PageRendering";
import {RegistrationPage} from "RegistrationPage";
import {PageProps} from "shared/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(RegistrationPage, pageProps);
}
