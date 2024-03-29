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

            if(undefinedParam.defaultValue) {
                params[paramName] = undefinedParam.defaultValue;
            } else if(undefinedParam.type === "virtual" && undefinedParam.script) {
                // Run param script.
                let paramValue: string;
                try {
                    paramValue = await this.scriptRunner.runParamScript(projectPath, undefinedParam.script, params);
                } catch(err) {
                    throw new Error(`Script for param '${paramName}' failed with the following error: ${err}`);
                }
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
                const displayName: string = undefinedParam.displayName ? undefinedParam.displayName : paramName;
                const description: string = undefinedParam.description ? ` - ${undefinedParam.description}` : "";
                const caption: string = this.getCaption(undefinedParam); 
                const message: string = `Enter a value for the following parameter: '${displayName}'${description}${caption}`;
                const paramValue: string = (await this.textPrompt.show(message, { maxRetries: Retries.Indefinite })).getValue();
                params[paramName] = paramValue;
            }
  
        }

        return params;
    }

    private getCaption(undefinedParam: PackageConfigParam): string {
        if(undefinedParam.defaultValue !== undefined && undefinedParam.defaultValue !== null) {
            return ` (${undefinedParam.defaultValue}) `;
        }
        if(undefinedParam.type === 'optional') {
            return ' (optional) ';
        }
        return '';
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
                if(param.type === "flag") {
                    resolvedParams[paramName] = "true";
                }
                else if(param.type === "optional") {
                    if(++i >= args.length) {
                        throw new Error(`No value found for optional argument: ${paramName}`);
                    }
                    resolvedParams[paramName] = args[i];
                } else {
                    throw new Error(`Not an optional argument: ${paramName} (${param.type})`);
                }
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
                if(param.type !== "flag") {
                    undefinedParams.push(param);
                }
            }
        }
    
        return {
            resolvedParams: resolvedParams,
            undefinedParams: undefinedParams
        };
    }

}