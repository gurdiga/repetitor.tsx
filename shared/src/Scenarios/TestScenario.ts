import {SystemError} from "shared/Model/Utils";

export type TestScenarioDTO = {};
export type TestScenarioResult = {rows: [{sum: number}]} | SystemError;
