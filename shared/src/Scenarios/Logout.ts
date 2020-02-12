import {UnexpectedError} from "shared/Model/Utils";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LogoutDTO {}

type LogoutSuccess = {
  kind: "LogoutSuccess";
};

export type LogoutResult = LogoutSuccess | UnexpectedError;
