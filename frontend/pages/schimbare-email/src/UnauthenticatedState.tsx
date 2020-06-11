import React = require("react");
import {Step2} from "frontend/pages/schimbare-email/src/Step2";
import {NeedsAuthentication} from "frontend/shared/src/Components/NeedsAuthentication";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";

interface Props {
  params: QueryStringParams;
}

export function UnauthenticatedState(props: Props) {
  const {params} = props;

  return "token" in params ? (
    <Step2 {...{token: params.token}} />
  ) : (
    <NeedsAuthentication>
      <p>Pentru a vă schima adresa de email, mai întîi trebuie să vă atentificați.</p>
    </NeedsAuthentication>
  );
}
