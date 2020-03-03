import {PageRendering} from "frontend/shared/PageRendering";
import {TutorPasswordRecoveryPage} from "TutorPasswordRecoveryPage";
import {PageProps} from "shared/Utils/PageProps";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(TutorPasswordRecoveryPage, pageProps);
}
