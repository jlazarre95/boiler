import { ValidationError } from "class-validator";

interface IValidationErrorEntry {
    prefix: string;
    error: ValidationError;
}

export interface IValidationErrorMessageOptions {
    prefix?: string;
    suffix?: string;
    parent?: boolean;
}

export function getValidationErrorMessage(errors: ValidationError[], options: IValidationErrorMessageOptions = {}): string {
    const { prefix = "- ", suffix = "\n", parent = true } = options;
    
    let message: string = "";
    const stk: IValidationErrorEntry[] = []; 
    for(let i = errors.length - 1; i >= 0; i--) {
        const error: ValidationError = errors[i];
        stk.push({ 
            prefix: "$", 
            error: error 
        });
    }
    while(stk.length > 0) {
        const entry: IValidationErrorEntry = stk.pop();
        for(const constraintKey in entry.error.constraints) {
            message += prefix;
            message += (parent ? entry.prefix + ": " : ""); 
            message += entry.error.constraints[constraintKey];
            message += suffix;
        }
        if(entry.error.children) {
            for(let i = entry.error.children.length - 1; i >= 0; i--) {
                const child: ValidationError = entry.error.children[i];
                stk.push({ 
                    prefix: entry.prefix + "." +  entry.error.property, 
                    error: child 
                });
            }
        }
    }
    return message;
}