import { getValidationErrorMessage } from "@app/utils/validation.utils";
import { ValidationArguments, ValidationError, Validator, ValidatorConstraintInterface } from "class-validator";

export abstract class SimpleValidator implements ValidatorConstraintInterface {

    protected validator: Validator = new Validator();
    protected isValid: boolean;
    protected isArray: boolean;

    private messages: string[]
    private seenMessages: Set<string>;

    constructor() {
    }

    abstract validate(value: any, args: ValidationArguments): boolean;

    addError(message: string) {
        if(!this.seenMessages.has(message)) {
            this.messages.push(message);
            this.seenMessages.add(message);
        }
        this.isValid = false;
    }

    addErrors(errors: ValidationError[]) {
        if(errors.length > 0) {
            const message: string = getValidationErrorMessage(errors, { prefix: "", suffix: "\n", parent: false });
            message.substring(0, message.length - 1).split("\n").forEach(m => {
                this.addError(m);
            });
        }
    }

    defaultMessage(args: ValidationArguments): string {
        let message: string = (this.isArray ? "each value in " : "") + args.property + " should not violate the following constraints: ";
        for(const m of this.messages) {
            message += m + "; ";
        }
        return message.length > 0 ? message.substring(0, message.length - 2) : "";
    }

    protected reset() {
        this.isValid = true;
        this.isArray = false;
        this.messages = [];
        this.seenMessages = new Set<string>();
    }

}