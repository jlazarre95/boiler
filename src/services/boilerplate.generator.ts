import { ConsoleColors } from "@app/console/console-colors";
import { ScriptRunner } from "@app/services/script.runner";
import { IBoilerplateContext } from "@app/types/boilerplate-context.interface";
import { Dict } from "@app/types/dict.type";
import { PackageConfig, PackageConfigTemplate, PackageConfigTemplateInclude } from "@app/types/package-config.class";
import { evalString, evalUrl } from "@app/utils/boilerplate.utils";
import { getPackageConfigPath, getScriptPath, getTemplatePath } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { dirname, join } from "path";
import { ParamResolver } from "./param.resolver";

export class BoilerplateGenerator {

    constructor(private paramResolver: ParamResolver, private scriptRunner: ScriptRunner) { }

    async generateBoilerplate(projectPath: string, boilerplatePath: string, packageName: string, templateName: string, args: string[]) {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON(getPackageConfigPath(boilerplatePath, packageName)));
        const params: Dict<string, string> = await this.paramResolver.resolveParams(projectPath, boilerplatePath, packageName, templateName, config, args);
        const context: IBoilerplateContext = { params: params, outDir: "" };
        await this.scriptRunner.runScript(projectPath, getScriptPath(boilerplatePath, packageName, `before.js`), context);
        await this.generateBoilerplateTemplate(projectPath, boilerplatePath, packageName, templateName, config, context);
        await this.scriptRunner.runScript(projectPath, getScriptPath(boilerplatePath, packageName, `after.js`), context);
    }
    
    private async generateBoilerplateTemplate(projectPath: string, boilerplatePath: string, packageName: string, templateName: string, 
                                              config: PackageConfig, context: IBoilerplateContext) {
        const template: PackageConfigTemplate = config.findTemplate(templateName);
        if(!template) {
            throw new Error(`Package ${packageName} does not contain a template called ${templateName}!`);
        }
        
        // TODO remove
        if(!template.outDir) template.outDir = "";
    
        await this.scriptRunner.runScript(projectPath, getScriptPath(boilerplatePath, packageName, `before-${templateName}.js`), context);
    
        // Convert included templates to an array.
        let includes: (string | PackageConfigTemplateInclude)[];
        if(typeof template.include === "string") {
            includes = [new PackageConfigTemplateInclude(template.include)];
        } else {
            includes = template.include;
        }
    
        // Generate boilerplate for each included template.
        for(let include of includes) {
            include = typeof include === "string" ? new PackageConfigTemplateInclude(include) : include;
            
            // TODO remove
            if(!include.outDir) include.outDir = "";
            
            const newContext: IBoilerplateContext = { 
                outDir: join(context.outDir, template.outDir, include.outDir), 
                params: context.params
            };
    
            const templatePath: string = await getTemplatePath(boilerplatePath, packageName, include.name);
            if(await fs.pathExists(templatePath)) {
                // Template file.
                await this.generateBoilerplateFile(projectPath, boilerplatePath, packageName, include.name, config, newContext);
            } else {
                // Template name.
                await this.generateBoilerplateTemplate(projectPath, boilerplatePath, packageName, include.name, config, newContext);
            }
        }
    
        await this.scriptRunner.runScript(projectPath, getScriptPath(projectPath, packageName, `after-${templateName}.js`), context);
    }
    
    private async generateBoilerplateFile(projectPath: string, boilerplatePath: string, packageName: string, 
                                          templateName: string, config: PackageConfig, context: IBoilerplateContext) {
        // Run before script.
        await this.scriptRunner.runScript(projectPath, getScriptPath(boilerplatePath, packageName, `before-${templateName}.js`), context);
    
        // Load template.
        const templatePath: string = await getTemplatePath(boilerplatePath, packageName, templateName);
        const template: string = (await fs.readFile(templatePath)).toString();
    
        // Generate boilerplate.
        const boilerplate: string = evalString(template, context.params);
    
        // Save boilerplate.
        // TODO use --force to replace existing files.
        const destPath: string = join(context.outDir, templateName);
        const modifiedDestPath = evalUrl(destPath, config, context.params);
        await fs.mkdirp(dirname(modifiedDestPath));
        await fs.writeFile(modifiedDestPath, boilerplate);
    
        // Run after script.
        await this.scriptRunner.runScript(projectPath, getScriptPath(boilerplatePath, packageName, `after-${templateName}.js`), context);
    
        console.log(`${ConsoleColors.Green}+${ConsoleColors.Reset} ${modifiedDestPath}`);
    }

}