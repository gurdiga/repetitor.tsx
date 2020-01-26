import {FormValidation} from "frontend/shared/FormValidation";
import {ValidationRules} from "shared/Validation";

export namespace FormField {
  export interface CommonProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    value: string;
    validationRules: ValidationRules;
    onValueChange: FormValidation.ValueChangeHandler;
    showValidationMessage: boolean;
    validationMessages: Record<string, string>;
  }
}
