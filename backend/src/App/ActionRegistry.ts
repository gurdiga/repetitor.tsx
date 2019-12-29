import {TestAction} from "App/Actions/TestAction";
import {RegisterUser} from "App/Actions/RegisterUser";

type HandlerFunction = (params: any) => any;

export const ActionRegistry: {[actionName: string]: HandlerFunction} = {
  RegisterUser,
  TestAction,
};
