export interface UserSession {
  userId?: number;
  email?: string;
}

export function initializeUserSession(sessionObject: UserSession, props: UserSession): void {
  for (const propName in props) {
    (sessionObject as any)[propName] = (props as any)[propName];
  }
}

export function clearUserSession(sessionObject: UserSession): void {
  initializeUserSession(sessionObject, {
    userId: undefined,
    email: undefined,
  });
}
