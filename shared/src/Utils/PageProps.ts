import {UserSession} from "shared/src/Model/UserSession";

export interface PageProps {
  isAuthenticated: boolean;
  email?: string;
}

export function pagePropsFromSession(session: UserSession): PageProps {
  return {
    isAuthenticated: Boolean(session.userId),
    email: session.email,
  };
}
