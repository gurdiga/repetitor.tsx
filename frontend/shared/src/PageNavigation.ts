type PagePah = "/";

export function navigateToPage(pagePath: PagePah): void {
  location.assign(pagePath);
}
