import * as React from "react";
import * as ReactDOM from "react-dom";
import {forceRenderStyles} from "typestyle";
import {PageProps} from "shared/src/Utils/PageProps";

export namespace PageRendering {
  export function renderPage<P extends PageProps>(PageComponent: React.FunctionComponent<P>, pageProps: P): void {
    ReactDOM.render(<PageComponent {...pageProps} />, document.getElementById("root"));
    forceRenderStyles();
  }
}
