import { BoilerConstants } from "@app/constants";
import { Retries } from "@app/prompt/retries";
import { TextPrompt } from "@app/prompt/text.prompt";
import { Dict } from "@app/types/dict.type";
import { ITemplateParamTable, PackageConfig, PackageConfigParam } from "@app/types/package-config.class";
import { getScriptsPath } from "@app/utils/directory.utils";
import * as fsExtra from "fs-extra";
import { join } from "path";
import { ScriptRunner } from "./script.runner";

interface IParsedArgs {
    resolvedParams: Dict<string, string>;
    undefinedParams: PackageConfigParam[];
}

export class ParamResolver {
    
    constructor(private scriptRunner: ScriptRunner, private textPrompt: TextPrompt, private fs: typeof fsExtra = fsExtra) {
        
    }

    async resolveParams(projectPath: string, boilerplatePath: string, packageName: string, templateName: string, 
                        config: PackageConfig, args: string[]): Promise<Dict<string, string>> {
                            
        const parsedArgs: IParsedArgs = this.parseArgs(config, templateName, args);
        const params: Dict<string, string> = parsedArgs.resolvedParams;

        for(const undefinedParam of parsedArgs.undefinedParams) {
            const paramName: string = undefinedParam.name;
            const promptScriptPath: string = join(getScriptsPath(boilerplatePath, packageName), `${paramName}-prompt${BoilerConstants.SCRIPT_EXT}`);

            if(undefinedParam.type === "virtual" && undefinedParam.script) {
                // Run param script.
                const paramValue: string = await this.scriptRunner.runParamScript(projectPath, undefinedParam.script, params);
                if(!paramValue) {
                    throw new Error(`Param script did not return a value for parameter '${paramName}': ${undefinedParam.script}`);
                }
                params[paramName] = paramValue;
            } else if(await this.fs.pathExists(promptScriptPath)) {
                // Run custom prompt.
                await this.scriptRunner.runScript(projectPath, promptScriptPath, { params: params });
                if(!params[paramName]) {
                    throw new Error(`Custom prompt did not set a value for parameter '${paramName}': ${paramName}-prompt${BoilerConstants.SCRIPT_EXT}`);
                }
            } else {
                // Run default prompt (should automatically add to params).
                const paramValue: string = (await this.textPrompt.show(`Enter a value for the following parameter: '${paramName}'`, { maxRetries: Retries.Indefinite })).getValue();
                params[paramName] = paramValue;
            }
  
        }

        return params;
    }

    private parseArgs(config: PackageConfig, templateName: string, args: string[]): IParsedArgs {
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
                    throw new Error(`Unknown optional argument: ${paramName}`);
                } 
                if(param.type !== "optional") {
                    throw new Error(`Not an optional argument: ${paramName} (${param.type})`);
                }
                if(++i >= args.length) {
                    throw new Error(`No value found for optional argument: ${paramName}`);
                }
                resolvedParams[paramName] = args[i];
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
            if(!resolvedParams[param.name] && param.type !== "positional") {
                undefinedParams.push(param);
            }
        }
    
        return {
            resolvedParams: resolvedParams,
            undefinedParams: undefinedParams
        };
    }

}