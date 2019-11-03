import { BoilerConstants } from "@app/constants";
import { PackageConfig, PackageConfigTemplate } from "@app/types/package-config.class";
import { assertPackageExists, assertProjectExists, getPackageConfigPath, getPackagePath, getPackagesPath, getProjectBoilerPath, getScriptPath, getScriptsPath, getTemplatePath, getTemplatesPath } from "@app/utils/directory.utils";
import { ROOT_DIR } from "@settings";
import * as fs from "fs-extra";
import { basename, extname, join } from "path";

export class ProjectService {

    async initializeProject(projectPath: string) {
        await assertProjectExists(projectPath);
        await fs.ensureDir(getProjectBoilerPath(projectPath));
    }

    async createPackage(projectPath: string, packageName: string) {
        await this.initializeProject(projectPath);
        await fs.ensureDir(getPackagesPath(projectPath));
        
        // Create new package directory if it does not exist.
        const packagePath: string = getPackagePath(projectPath, packageName);
        if(await fs.pathExists(packagePath)) {
            throw new Error("Directory already exists");
        }
        await fs.mkdir(packagePath);

        // Create a default boiler.json.
        await fs.copyFile(join(ROOT_DIR, "resources/boiler.default.json"), getPackageConfigPath(projectPath, packageName));
    }

    async createTemplate(projectPath: string, packageName: string, templateName: string) {
        await assertPackageExists(projectPath, packageName);
        await fs.ensureDir(getTemplatesPath(projectPath, packageName));

        // Load package config.
        const packageConfigPath: string = getPackageConfigPath(projectPath, packageName);
        const packageConfigJSON: any = await fs.readJSON(packageConfigPath);
        const packageConfig: PackageConfig = PackageConfig.create(packageConfigJSON);

        // Remove ".boiler" extension from template name if present.
        templateName = basename(templateName, BoilerConstants.TEMPLATE_EXT);
        
        // Create new template file if it does not exist.
        const templatePath: string = getTemplatePath(projectPath, packageName, templateName);
        if(await fs.pathExists(templatePath)) {
            throw new Error("Template already exists");
        }
        await fs.writeFile(templatePath, "");

        // Add template to package config.
        const template: PackageConfigTemplate = new PackageConfigTemplate();
        template.name = templateName;
        template.include = [templateName + BoilerConstants.TEMPLATE_EXT];
        if(!packageConfig.templates) {
            packageConfig.templates = [];
        }
        packageConfig.templates.push(template);
    
        // Save package config.
        await fs.writeFile(packageConfigPath, JSON.stringify(packageConfig, null, 2));
    }

    async createScript(projectPath: string, packageName: string, scriptName: string) {
        await assertPackageExists(projectPath, packageName);
        await fs.ensureDir(getScriptsPath(projectPath, packageName));

        // Remove ".js" extension from template name if present.
        scriptName = basename(scriptName, BoilerConstants.SCRIPT_EXT);

        // Create new script file if it does not exist.
        const scriptPath: string = getScriptPath(projectPath, packageName, scriptName);
        if(await fs.pathExists(scriptPath)) {
            throw new Error("Script already exists");
        }
        await fs.writeFile(scriptPath, "");
    }

    async templatizePackage(projectPath: string, packageName: string) {
        await assertPackageExists(projectPath, packageName);
        const templatesPath: string = getTemplatesPath(projectPath, packageName);
        if(await fs.pathExists(templatesPath)) {
            for(const f of await fs.readdir(templatesPath)) {
                const templatePath: string = join(templatesPath, f);
                const stats: fs.Stats = await fs.lstat(templatePath);
                if(stats.isFile && extname(templatePath) !== BoilerConstants.TEMPLATE_EXT) {
                    await fs.rename(templatePath, templatePath + BoilerConstants.TEMPLATE_EXT);
                }
            }
        }
    }

}