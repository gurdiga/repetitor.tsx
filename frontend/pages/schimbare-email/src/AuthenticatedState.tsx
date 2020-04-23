import {Step1} from "frontend/pages/schimbare-email/src/Step1";
import {Step2} from "frontend/pages/schimbare-email/src/Step2";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import React = require("react");

interface Props {
  currentEmail: string;
  params: QueryStringParams;
}

export function AuthenticatedState(props: Props) {
  const {params, currentEmail} = props;

  return "token" in params ? <Step2 {...{token: params.token}} /> : <Step1 {...{currentEmail}} />;
}
