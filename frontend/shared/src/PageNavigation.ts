export enum PagePath {
  Home = "/",
  TutorRegistration = "/inregistrare-repetitor/",
  TutorLogin = "/autentificare-repetitor/",
}

export function navigateToPage(pagePath: PagePath): void {
  location.assign(pagePath);
}
