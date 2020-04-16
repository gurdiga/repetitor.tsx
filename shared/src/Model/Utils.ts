import {ErrorMessages} from "shared/src/Utils/Validation";
import {omit} from "shared/src/Utils/Language";

export type Success = {
  kind: "Success";
};

export type DbError = {
  kind: "DbError";
  errorCode: DbErrorCode;
};

export const DbErrorMessages: ErrorMessages<DbErrorCode> = {
  GENERIC_DB_ERROR: "Eroare neprevăzută de bază de date",
};

export type DbErrorCode = "GENERIC_DB_ERROR";

export type UnexpectedError = {
  kind: "UnexpectedError";
  error: string;
};

export type DataProps<T> = Omit<T, "kind">;

export function dataProps<SI extends any>(scenarioInput: SI): DataProps<SI> {
  return omit(scenarioInput, "kind");
}

export type SystemError = DbError | UnexpectedError;
