namespace App {
    export interface ValidationParams {
        value: string | number;
        required: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    }

    export function validateUserInput(inputParams: ValidationParams) {
        let isValid = true;
        if (inputParams.required) {
            isValid = isValid && inputParams.value.toString().trim().length !== 0;
        }
        if (typeof inputParams.value === "string") {
            if (inputParams.minLength != null) {
                isValid = isValid && inputParams.value.length >= inputParams.minLength;
            }
            if (inputParams.maxLength != null) {
                isValid = isValid && inputParams.value.length <= inputParams.maxLength;
            }
        }
        if (typeof inputParams.value === "number") {
            if (inputParams.min != null) {
                isValid = isValid && inputParams.value >= inputParams.min;
            }
            if (inputParams.max != null) {
                isValid = isValid && inputParams.value <= inputParams.max;
            }
        }
        return isValid;
    }
}
