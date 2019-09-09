import * as React from "react";

import * as Styles from "HelloWorld.css";

interface Props {
  name?: string;
}

export class Hello extends React.Component<Props, {}> {
  render() {
    return <span className={Styles.title}>Hello {this.props.name || "World"}</span>;
  }
}
