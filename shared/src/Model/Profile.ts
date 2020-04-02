// Reference: https://beta.workflowy.com/#/8634d2e2a7e4
export type ProfileLoaded = {
  kind: "ProfileLoaded";
  fullName: string;
  email: string;
  photo: Link;
  resume: MarkdownDocument;
  isPublished: boolean;
};

export type NotAuthenticatedError = {
  kind: "NotAuthenticatedError";
};

export type ProfileNotFoundError = {
  kind: "ProfileNotFoundError";
};

type Link = {
  kind: "Link";
  value: string;
};

type MarkdownDocument = {
  kind: "MarkdownDocument";
  value: string;
};
