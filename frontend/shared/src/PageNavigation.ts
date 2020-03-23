import {PagePath} from "shared/src/Utils/PagePath";

export function navigateToPage(pagePath: PagePath): void {
  location.assign(pagePath);
}
