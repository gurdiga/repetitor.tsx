export interface ServerResponse {
  responseType: ServerResponseType;
  responseText: string;
  shouldShow: boolean;
}

export type ServerResponseType = "notAskedYet" | "success" | "error";

export async function postAction(actionName: ActionName, actionParams: any): Promise<any> {
  const response = await fetch("http://localhost:8084", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actionName,
      actionParams,
    }),
    redirect: "error",
    cache: "no-store",
  });

  return await response.json();
}
