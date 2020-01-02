import * as React from "react";
import * as ReactDOM from "react-dom";
import {forceRenderStyles} from "typestyle";

export namespace PageRendering {
  export function render(reactClass: React.FunctionComponent | React.ComponentClass): void {
    ReactDOM.render(React.createElement(reactClass), document.getElementById("root"));
    forceRenderStyles();
  }
}
