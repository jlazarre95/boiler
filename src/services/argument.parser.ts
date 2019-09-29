import { Dict } from "@app/types/dict.type";
import { ITemplateParamTable, PackageConfig, PackageConfigParam } from "@app/types/package-config.class";

export interface IParsedParams {
    resolvedParams: Dict<string, string>;
    undefinedParams: PackageConfigParam[];
}

export class ArgumentParser {

    parseArgs(config: PackageConfig, templateName: string, args: string[]): IParsedParams {
        const templateParamTable: ITemplateParamTable = config.getTemplateParams(templateName);
        const resolvedParams: Dict<string, string> = {};
    
        let setPositional: boolean = false;
        for(let i = 0; i < args.length; i++) {
            const arg: string = args[i];
            if(arg.indexOf("--") == 0) {
                // Optional
                const paramName: string = arg.slice(2);
                const param: PackageConfigParam = templateParamTable.params[paramName];
                if(!param) {
                    throw new Error(`Unknown optional argument: ${arg}`);
                } 
                if(param.type !== "optional") {
                    throw new Error(`Not an optional argument: ${arg} (${param.type})`);
                }
                if(++i >= args.length) {
                    throw new Error(`No value found for optional argument: ${arg}`);
                }
                resolvedParams[param.name] = args[i];
            } else {
                // Positional
                if(setPositional) {
                    throw new Error("Multiple positional arguments are not allowed");
                }
                const param: PackageConfigParam = templateParamTable.positionalParam;
                if(!param) {
                    throw new Error(`This template does not support positional arguments: ${arg}`);
                }
                resolvedParams[param.name] = arg;
                setPositional = true;
            }
        }

        const undefinedParams: PackageConfigParam[] = [];
        if(!setPositional && templateParamTable.positionalParam) {
            undefinedParams.push(templateParamTable.positionalParam);
        }
    
        for(const param of Object.values(templateParamTable.params)) {
            if(!resolvedParams[param.name]) {
                undefinedParams.push(param);
            }
        }
    
        console.log("argument.parser.ts: params:", resolvedParams);
        return {
            resolvedParams: resolvedParams,
            undefinedParams: undefinedParams
        };
    }

}