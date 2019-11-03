import { ValidationException } from '@app/exceptions/validation.exception';
import { Dict } from '@app/types/dict.type';
import { getValidationErrorMessage } from '@app/utils/validation.utils';
import { IsTemplateInclude } from '@app/validators/template-include.validator';
import { IsTemplateRequire } from '@app/validators/template-require.validator';
import { IsVirtualParam } from '@app/validators/virtual-param-type.validator';
import { plainToClass, Type } from 'class-transformer';
import { IsDefined, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested, validateSync } from "class-validator";
import "reflect-metadata";

export interface ITemplateParamTable {
    params: Dict<string, PackageConfigParam>;
    positionalParam?: PackageConfigParam;
}

export class PackageConfigParam {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @IsString()
    @IsIn(["positional", "flag", "optional", "virtual"])
    @IsVirtualParam({ script: "script" }, { message: "must specify script when param is virtual" })
    type: "positional" | "flag" | "optional" | "virtual";

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    script?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    defaultValue?: string;
}

export class PackageConfigTemplateRequire extends PackageConfigParam {

}

export class PackageConfigTemplateInclude {
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    outDir?: string;
    
    constructor(name: string) { 
        this.name = name;
    }
}

export class PackageConfigTemplate {
    @IsString()
    @IsNotEmpty()
    name: string;
 
    @IsTemplateRequire()
    @IsOptional()
    require?: (string | PackageConfigTemplateRequire)[];

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    outDir?: string;

    @IsTemplateInclude()
    include: string | (string | PackageConfigTemplateInclude)[];
}

export class PackageConfigFileReplace {
    @IsString()
    @IsNotEmpty()
    target: string;

    @IsString()
    @IsDefined()
    with: string;
}

export class PackageConfigOutputFile {
    @ValidateNested({ each: true })
    @Type(() => PackageConfigFileReplace)
    @IsOptional()
    replace?: PackageConfigFileReplace[];
}

export class PackageConfigOutput {
    @ValidateNested()
    @Type(() => PackageConfigOutputFile)
    @IsOptional()
    file?: PackageConfigOutputFile;
}

export class PackageConfig {
    @ValidateNested({ each: true })
    @Type(() => PackageConfigParam)
    @IsOptional()
    params?: PackageConfigParam[];

    @ValidateNested({ each: true })
    @Type(() => PackageConfigTemplate)
    @IsOptional()
    templates?: PackageConfigTemplate[];

    @ValidateNested()
    @Type(() => PackageConfigOutput)
    @IsOptional()
    output?: PackageConfigOutput;

    static create(obj: any = {}): PackageConfig {
        const config: PackageConfig = plainToClass(PackageConfig, obj);
        const errs = validateSync(config);
        if(errs.length > 0) {
            throw new ValidationException("Validation error: \n" + getValidationErrorMessage(errs)); 
        }
        return config;
    }

    findParam(name: string): PackageConfigParam {
        for(const p of this.params) {
            if(p.name === name) {
                return p;
            }
        }
        return null; 
    }

    findTemplate(name: string): PackageConfigTemplate {
        for(const t of this.templates) {
            if(t.name === name) {
                return t;
            }
        }
        return null; 
    }

    getTemplateParams(templateName: string): ITemplateParamTable {
        const template: PackageConfigTemplate = this.findTemplate(templateName);
        if(!template) throw new Error("Template not found");

        // Find all params required by template.
        const paramTable: ITemplateParamTable = { params: {} };

        if(template.require) {
            for(const p of template.require) {
                let param: PackageConfigParam;
                if(typeof p === "string") {
                    param = this.findParam(p);
                    if(!param) {
                        throw new Error(`Template requires undefined parameter: ${p}`);
                    }
                } else {
                    param = p;
                }
    
                if(param.type === "positional") {
                    if(paramTable.positionalParam) {
                        throw new Error("Template defines multiple positional parameters");
                    }
                    paramTable.positionalParam = param;
                }
                paramTable.params[param.name] = param;
            }
        }

        return paramTable;
    }
    
}

