import {ClientSideProfile} from "shared/src/Model/Profile";

export interface UserSession {
  userId?: number;
  email?: string;
}

export interface UserSession2 {
  userId: number;
  profile: ClientSideProfile;
}

export function initializeUserSession(sessionObject: UserSession, props: Required<UserSession>): void {
  for (const propName in props) {
    (sessionObject as any)[propName] = (props as any)[propName];
  }
}

export function clearUserSession(sessionObject: UserSession): void {
  delete sessionObject.userId;
  delete sessionObject.email;
}
