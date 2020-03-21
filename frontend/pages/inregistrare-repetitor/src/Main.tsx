import {PageRendering} from "frontend/shared/src/PageRendering";
import {TutorRegistrationPage} from "frontend/pages/inregistrare-repetitor/src/TutorRegistrationPage";
import {PageProps} from "shared/src/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(TutorRegistrationPage, pageProps);
}
