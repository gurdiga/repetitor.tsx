export type DbError = {
  kind: "DbError";
  errorCode: DbErrorCode;
};

export type DbErrorCode = "ERROR";

export type UnexpectedError = {
  kind: "UnexpectedError";
  errorCode: string;
};
