export enum PagePath {
  Home = "/",
  TutorRegistration = "/inregistrare-repetitor/",
  TutorLogin = "/autentificare-repetitor/",
  TutorPasswordReset = "/resetare-parola/",
}

export function navigateToPage(pagePath: PagePath): void {
  location.assign(pagePath);
}
