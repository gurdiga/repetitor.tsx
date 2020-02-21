import {SystemError} from "shared/Model/Utils";

export type TestScenarioInput = {};
export type TestScenarioResult = {rows: [{sum: number}]} | SystemError;
