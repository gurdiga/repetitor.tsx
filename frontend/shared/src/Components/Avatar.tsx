import * as React from "react";
import {ClientSideProfile} from "shared/src/Model/Profile";

interface Props {
  url: ClientSideProfile["avatarUrl"]; // When undefined render a default avatar or a spinner
}

export function Avatar(props: Props) {
  return props.url ? <img src={props.url} width="100" height="100" /> : <p>No photo.</p>;
}
