import * as React from "react";
import {LabelCss} from "frontend/shared/src/Components/FormFields/Label.css";
import {classList} from "frontend/shared/src/Utils/ClassList";

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label(props: Props) {
  const {children, className: customClassName, ...rest} = props;
  const className = classList(LabelCss.Label, customClassName);

  return (
    <label className={className} {...rest}>
      {children}
    </label>
  );
}
