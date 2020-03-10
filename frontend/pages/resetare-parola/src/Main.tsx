import {PageRendering} from "frontend/shared/PageRendering";
import {TutorPasswordResetPage} from "TutorPasswordResetPage";
import {PageProps} from "shared/Utils/PageProps";
import {getQueryStringParams} from "frontend/shared/Utils/QueryStringParams";

export function main(pageProps: PageProps, locationSearch: string): void {
  const params = getQueryStringParams(locationSearch);

  PageRendering.renderPage(TutorPasswordResetPage, {...pageProps, params});
}
