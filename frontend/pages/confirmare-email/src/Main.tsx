import {PageProps} from "shared/src/Utils/PageProps";
import {EmailConfirmationPage} from "frontend/pages/confirmare-email/src/EmailConfirmationPage";
import {PageRendering} from "frontend/shared/src/PageRendering";
import {getQueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";

export function main(pageProps: PageProps, locationSearch: string): void {
  const params = getQueryStringParams(locationSearch);

  PageRendering.renderPage(EmailConfirmationPage, {...pageProps, params});
}
