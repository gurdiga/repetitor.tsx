import {SystemError} from "shared/src/Model/Utils";

export type TestScenarioInput = {};
export type TestScenarioResult = {rows: [{sum: number}]} | SystemError;
