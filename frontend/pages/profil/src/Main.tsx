import {PageProps} from "shared/src/Utils/PageProps";
import {ProfilePage} from "frontend/pages/profil/src/ProfilePage";
import {PageRendering} from "frontend/shared/src/PageRendering";

export function main(pageProps: PageProps): void {
  PageRendering.renderPage(ProfilePage, pageProps);
}
