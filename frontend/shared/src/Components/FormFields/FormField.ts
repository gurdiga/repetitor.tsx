import {FormValidation} from "frontend/shared/FormValidation";

export namespace FormField {
  export interface CommonProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    value: string;
    validationRules: FormValidation.ValidationRules;
    onValueChange: FormValidation.ValueChangeHandler;
    showValidationMessage: boolean;
    validationMessages: Record<string, string>;
  }
}
