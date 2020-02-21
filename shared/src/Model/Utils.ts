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
  error: string;
};

export type DataProps<T> = Omit<T, "kind">;

export function dataProps<SI extends any>(scenarioInput: SI): DataProps<SI> {
  const entries = Object.entries(scenarioInput).filter(([propName]) => propName === "kind");

  return Object.fromEntries(entries) as DataProps<SI>;
}

export type SystemError = DbError | UnexpectedError;
