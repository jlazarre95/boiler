import { BoilerConstants } from "@app/constants";
import * as fs from "fs-extra";
import { join } from "path";

export async function assertProjectExists(projectPath: string) {
    if(!await fs.pathExists(projectPath)) {
        throw new Error("Project directory does not exist");
    }
}

export async function assertPackageExists(projectPath: string, packageName: string) {
    await assertProjectExists(projectPath);
    if(!await fs.pathExists(getPackagePath(projectPath, packageName))) {
        throw new Error("Package does not exist");
    }
    if(!await fs.pathExists(getPackageConfigPath(projectPath, packageName))) {
        throw new Error("Not a package: boiler.json does not exist");
    }
}

export function getProjectBoilerPath(projectPath: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME);
}

export function getPackagesPath(projectPath: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME, BoilerConstants.PKG_DIRNAME);
}

export function getPackagePath(projectPath: string, packageName: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME, BoilerConstants.PKG_DIRNAME, packageName);
}

export function getPackageConfigPath(projectPath: string, packageName: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME, BoilerConstants.PKG_DIRNAME, packageName, BoilerConstants.PKG_CONFIG_FILENAME);
}
 
export function getTemplatesPath(projectPath: string, packageName: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME, BoilerConstants.PKG_DIRNAME, packageName, BoilerConstants.TEMPLATES_DIRNAME);
}

export function getTemplatePath(projectPath: string, packageName: string, templateName: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME, BoilerConstants.PKG_DIRNAME, packageName, BoilerConstants.TEMPLATES_DIRNAME, templateName + BoilerConstants.TEMPLATE_EXT);
}

export function getScriptsPath(projectPath: string, packageName: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME, BoilerConstants.PKG_DIRNAME, packageName, BoilerConstants.SCRIPTS_DIRNAME);
}

export function getScriptPath(projectPath: string, packageName: string, scriptName: string): string {
    return join(projectPath, BoilerConstants.BOILER_DIRNAME, BoilerConstants.PKG_DIRNAME, packageName, BoilerConstants.SCRIPTS_DIRNAME, scriptName + BoilerConstants.SCRIPT_EXT);
}