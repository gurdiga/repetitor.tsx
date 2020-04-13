import {PageRendering} from "frontend/shared/src/PageRendering";
import {RegistrationPage} from "frontend/pages/inregistrare/src/RegistrationPage";
import {PageProps} from "shared/src/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(RegistrationPage, pageProps);
}
