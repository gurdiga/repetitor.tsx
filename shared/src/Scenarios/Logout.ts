import {UnexpectedError} from "shared/src/Model/Utils";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LogoutInput {}

type LogoutSuccess = {
  kind: "LogoutSuccess";
};

export type LogoutResult = LogoutSuccess | UnexpectedError;
