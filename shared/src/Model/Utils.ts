export type Success = {
  kind: "Success";
};

export type DbError = {
  kind: "DbError";
  errorCode: DbErrorCode;
};

export type DbErrorCode = "ERROR";

export type UnexpectedError = {
  kind: "UnexpectedError";
  errorCode: string;
};

export type DataProps<T> = Omit<T, "kind">;

export function dataProps<DTO extends any>(dto: DTO): DataProps<DTO> {
  const entries = Object.entries(dto).filter(([propName]) => propName === "kind");

  return Object.fromEntries(entries) as DataProps<DTO>;
}
