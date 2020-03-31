// Reference: https://beta.workflowy.com/#/8634d2e2a7e4
export type ProfileLoaded = {
  kind: "ProfileLoaded";
  fullName: string;
  email: string;
  photo: Link;
  phoneNumber: PhoneNumber;
  resume: MarkdownDocument;
  presentationVideo: Link;
  socialLinks: SocialLink[];
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

type PhoneNumber = {
  kind: "PhoneNumber";
  value: string;
};

export type SocialLink = {
  kind: "SocialLink";
  label: string;
  value: Link;
};

export function makeSocialLink(item: any): SocialLink | undefined {
  if (item.label && typeof item.label === "string" && item.value && typeof item.value === "string") {
    const value = makeLink(String(item.value));

    if (value) {
      return {
        kind: "SocialLink",
        label: String(item.label),
        value,
      };
    }
  }

  return undefined;
}

function makeLink(input: string): Link | undefined {
  try {
    const url = new URL(input);

    if (url.protocol === "http" || url.protocol === "https") {
      return {
        kind: "Link",
        value: url.toString(),
      };
    }
  } catch (error) {
    // What can I do?
  }

  return undefined;
}
