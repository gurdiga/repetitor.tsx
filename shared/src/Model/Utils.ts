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

export function dataProps<SI extends any>(scenarioInput: SI): DataProps<SI> {
  const result: any = {};

  for (const propName in scenarioInput) {
    if (propName !== "kind") {
      result[propName] = scenarioInput[propName];
    }
  }

  return result as DataProps<SI>;
}

export type SystemError = DbError | UnexpectedError;
