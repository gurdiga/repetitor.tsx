import React = require("react");

interface Props {
  token: string;
}

export function TokenVerificationView(props: Props) {
  return (
    <pre>
      &lt;TokenVerificationView {"{"}
      {JSON.stringify(props)}
      {"}"}/&gt;
    </pre>
  );
}
