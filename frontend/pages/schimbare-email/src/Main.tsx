import {EmailChangePage} from "frontend/pages/schimbare-email/src/EmailChangePage";
import {PageRendering} from "frontend/shared/src/PageRendering";
import {getQueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import {PageProps} from "shared/src/Utils/PageProps";

export function main(pageProps: PageProps, locationSearch: string): void {
  const params = getQueryStringParams(locationSearch);

  PageRendering.renderPage(EmailChangePage, {...pageProps, params});
}
