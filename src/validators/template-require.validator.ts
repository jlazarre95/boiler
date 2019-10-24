import { PackageConfigTemplateRequire } from "@app/types/package-config.class";
import { plainToClass } from "class-transformer";
import { registerDecorator, ValidationArguments, ValidationError, ValidationOptions } from "class-validator";
import { SimpleValidator } from "./simple.validator";

export class TemplateRequireValidator extends SimpleValidator {
    
    validate(value: (string | PackageConfigTemplateRequire)[], args: ValidationArguments): boolean { 
        this.reset();
        if(!this.validator.isArray(value)) {
            this.addError("must be an array");            
            return false;        
        }
        this.isArray = true;
        for(const require of value) {
            if(typeof require === "string") {
                if(this.validator.isEmpty(require)) {
                   this.addError("should not be an empty string");
                }
            } else {
                const requireObj: PackageConfigTemplateRequire = plainToClass(PackageConfigTemplateRequire, require);
                const errors: ValidationError[] = this.validator.validateSync(requireObj);
                this.addErrors(errors);
            }
        }
        return this.isValid;
    }
    
}

export function IsTemplateRequire(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isTemplateRequire",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: new TemplateRequireValidator()
        });
    }
}