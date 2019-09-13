import * as React from "react";

import {FlexChild} from "Common/PageLayout.css";

export const PageLayout = ({children}: {children?: React.ReactNode}) => (
  <div className={FlexChild}>
    <nav>Top navigation</nav>
    <main>Main content{children}</main>
    <footer>Footer</footer>
  </div>
);
