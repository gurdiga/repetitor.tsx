import {FormField} from "frontend/shared/src/Components/FormFields/FormField";
import {Label} from "frontend/shared/src/Components/FormFields/Label";
import {TextFieldCss} from "frontend/shared/src/Components/FormFields/TextField.css";
import * as React from "react";
import {DisplayOnlyFieldCss} from "frontend/shared/src/Components/FormFields/DisplayOnlyField.css";

interface Props extends Pick<FormField.CommonProps, "id" | "label" | "value" | "info"> {}

export function DisplayOnlyField(props: Props) {
  const {id, label, value, info} = props;

  return (
    <>
      <Label htmlFor={id}>{label}:</Label>
      {value ? (
        <output id={id} className={DisplayOnlyFieldCss.Value}>
          {value}
        </output>
      ) : (
        <code className={DisplayOnlyFieldCss.Value}>[No value?]</code>
      )}

      {info && (typeof info === "string" ? <p className={TextFieldCss.Info}>{info}</p> : info)}
    </>
  );
}
