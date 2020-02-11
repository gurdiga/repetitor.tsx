import {ErrorMessages} from "shared/Utils/Validation";

export type Success = {
  kind: "Success";
};

export type DbError = {
  kind: "DbError";
  errorCode: DbErrorCode;
};

export const dbErrorMessages: ErrorMessages<DbErrorCode> = {
  GENERIC_DB_ERROR: "Eroare neprevăzută de bază de date",
};

export type DbErrorCode = "GENERIC_DB_ERROR";

export type UnexpectedError = {
  kind: "UnexpectedError";
  errorCode: string;
};

export type DataProps<T> = Omit<T, "kind">;

export function dataProps<DTO extends any>(dto: DTO): DataProps<DTO> {
  const entries = Object.entries(dto).filter(([propName]) => propName === "kind");

  return Object.fromEntries(entries) as DataProps<DTO>;
}

export type SystemError = DbError | UnexpectedError;
