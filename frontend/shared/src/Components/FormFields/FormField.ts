import {FormValidation} from "frontend/shared/FormValidation";
import {ValidationRules} from "shared/Utils/Validation";

export namespace FormField {
  export interface CommonProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string | React.ReactElement;
    value: string;
    validationRules: ValidationRules;
    onValueChange: FormValidation.ValueChangeHandler;
    showValidationMessage: boolean;
    validationMessages: Record<string, string>;
    info?: string | React.ReactElement;
  }
}
