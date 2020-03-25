import {PageRendering} from "frontend/shared/src/PageRendering";
import {TutorLoginPage} from "frontend/pages/autentificare/src/TutorLoginPage";
import {PageProps} from "shared/src/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(TutorLoginPage, pageProps);
}
