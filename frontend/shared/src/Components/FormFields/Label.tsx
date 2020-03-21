import * as React from "react";
import {LabelCss} from "frontend/shared/src/Components/FormFields/Label.css";

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label(props: Props) {
  const {children, className: customClassName, ...rest} = props;
  const className = `${LabelCss.Label} ${customClassName}`;

  return (
    <label className={className} {...rest}>
      {children}
    </label>
  );
}
