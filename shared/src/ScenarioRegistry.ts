import {UserRegistrationHandler} from "shared/Scenarios/UserRegistration";
import {TestScenarioParams, TestScenarioResponse} from "shared/Scenarios/TestScenario";

export interface ScenarioRegistry {
  UserRegistration: {
    DTO: ParamsType<UserRegistrationHandler>;
    Response: PromisedType<UserRegistrationHandler>;
  };
  TestScenario: {
    DTO: TestScenarioParams;
    Response: TestScenarioResponse;
  };
}

export type ScenarioName = keyof ScenarioRegistry;

export type ParamsType<T> = T extends (params: infer P) => Promise<any> ? P : any;
export type PromisedType<T> = T extends (params: any) => Promise<infer R> ? R : any;
