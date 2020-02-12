import {PageRendering} from "frontend/shared/PageRendering";
import {TutorLoginPage} from "TutorLoginPage";
import {PageProps} from "shared/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(TutorLoginPage, pageProps);
}
