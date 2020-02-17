import {PageRendering} from "frontend/shared/PageRendering";
import {TutorRegistrationPage} from "TutorRegistrationPage";
import {PageProps} from "shared/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(TutorRegistrationPage, pageProps);
}
