import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export interface IVirtualParamProperties {
    script: string;
}

export function IsVirtualParam(properties: IVirtualParamProperties, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isVirtualParam",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [properties.script],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if(value === "virtual") {
                        const [scriptPropertyName] = args.constraints;
                        const script: string = (args.object as any)[scriptPropertyName];
                        return !!script;
                    } else {
                        return true;
                    }
                }
            }
        });
    }
}