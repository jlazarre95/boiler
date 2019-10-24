import { PackageConfigTemplateInclude } from "@app/types/package-config.class";
import { plainToClass } from "class-transformer";
import { registerDecorator, ValidationArguments, ValidationError, ValidationOptions } from "class-validator";
import { SimpleValidator } from "./simple.validator";

export class TemplateIncludeValidator extends SimpleValidator {

    validate(value: string | PackageConfigTemplateInclude[], args: ValidationArguments): boolean { 
        this.reset();
        if(!this.validator.isArray(value)) {
            this.addError("must be an array");
            return false;        
        }
        this.isArray = true;
        for(const include of value) {
            if(typeof include === "string") {
                if(this.validator.isEmpty(include)) {
                    this.addError("should not be an empty string");
                }
            } else {
                const includeObj: PackageConfigTemplateInclude = plainToClass(PackageConfigTemplateInclude, include);
                const errors: ValidationError[] = this.validator.validateSync(includeObj);
                this.addErrors(errors);
            }
        }
        return this.isValid;
    }
    
}

export function IsTemplateInclude(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isTemplateInclude",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: new TemplateIncludeValidator()
        });
    }
}