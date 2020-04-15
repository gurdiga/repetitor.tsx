import React = require("react");
import {DisplayOnlyField, DisplayOnlyFieldProps} from "frontend/shared/src/Components/FormFields/DisplayOnlyField";

export function DisplayOnlyPasswordField(props: Omit<DisplayOnlyFieldProps, "value">) {
  return <DisplayOnlyField value="****************" {...props} />;
}
