import {omit} from "shared/src/Utils/Language";
import {ErrorMessages} from "shared/src/Utils/Validation";

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

export function dataProps<T extends {kind: string}>(scenarioInput: T): DataProps<T> {
  return omit(scenarioInput, "kind");
}

export type SystemError = DbError | UnexpectedError;
