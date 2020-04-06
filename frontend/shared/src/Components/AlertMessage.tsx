import {AlertMessageCss} from "frontend/shared/src/Components/AlertMessage.css";
import * as React from "react";
import {ServerResponse, ResponseState} from "frontend/shared/src/ScenarioRunner";

export type AlertType = "success" | "info" | "error";

interface Props extends React.ComponentProps<any> {
  type: AlertType;
}

export function AlertMessage(props: Props) {
  return <p className={getClassForType(props.type)}>{props.children}</p>;
}

export function getClassForType(type: AlertType): string {
  switch (type) {
    case "success":
      return AlertMessageCss.Success;
    case "info":
      return AlertMessageCss.Info;
    case "error":
      return AlertMessageCss.Error;
  }
}

export function getAlertTypeForServerResponseState(serverResponseState: ResponseState): AlertType {
  switch (serverResponseState) {
    case ResponseState.NotYetSent:
      return "info";
    case ResponseState.ReceivedSuccess:
      return "success";
    case ResponseState.ReceivedError:
      return "error";
  }
}
