import {PageRendering} from "frontend/shared/PageRendering";
import {TutorPasswordResetPage} from "TutorPasswordResetPage";
import {PageProps} from "shared/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(TutorPasswordResetPage, pageProps);
}
