export enum PagePath {
  Home = "/",
  TutorRegistration = "/inregistrare-repetitor/",
  TutorLogin = "/autentificare-repetitor/",
  TutorPasswordRecovery = "/recuperare-parola/",
}

export function navigateToPage(pagePath: PagePath): void {
  location.assign(pagePath);
}
