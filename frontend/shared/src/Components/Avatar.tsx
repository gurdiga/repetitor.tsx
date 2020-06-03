import * as React from "react";
import {Link} from "shared/src/Model/Profile";

interface Props {
  url: Link | undefined; // When undefined render a default avatar or a spinner
}

export function Avatar(props: Props) {
  return props.url ? <img src={props.url.value} width="100" height="100" /> : <p>No photo.</p>;
}
