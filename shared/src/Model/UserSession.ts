export interface UserSession {
  userId?: number;
  email?: string;
}

export function initializeUserSession(sessionObject: UserSession, props: Required<UserSession>): void {
  Object.assign(sessionObject, props);
}

export function clearUserSession(sessionObject: UserSession): void {
  delete sessionObject.userId;
  delete sessionObject.email;
}
