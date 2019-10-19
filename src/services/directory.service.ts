import { BoilerConstants } from "@app/constants";
import { EnvironmentService } from "@app/services/environment.service";
import { assertPackageExists, getPackagesPath, getScriptsPath, getTemplatesPath } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { join } from "path";

export interface IPackageListingOptions {
    all?: boolean;
    global?: boolean;
    local?: boolean;
}

export interface IPackageListEntry {
    name: string;
    displayName: string;
    global: boolean;
}

export interface IPackageInfo {
    templates: string[];
    scripts: string[];
}

export class DirectoryService {

    constructor(private environmentService: EnvironmentService) { }

    async getPackageInfo(name: string, global: boolean = false): Promise<IPackageInfo> {
        const projectPath: string = global ? this.environmentService.getBoilerPath() : this.environmentService.getProjectPath();
        await assertPackageExists(projectPath, name);
        const templates: string[] = await fs.readdir(getTemplatesPath(projectPath, name));
        const scripts: string[] = await fs.readdir(getScriptsPath(projectPath, name));
        return {
            templates: templates.sort(),
            scripts: scripts.sort()
        };
    } 

    async getPackageList(options: IPackageListingOptions = {}): Promise<IPackageListEntry[]> {
        const { all = false, global = false, local = false } = options;
        let packages: IPackageListEntry[] = [];

        if(all || global) {
            const projectPath: string = this.environmentService.getBoilerPath();
            for(const packageName of await this.getPackagesHelper(projectPath)) {
                packages.push({
                    name: packageName,
                    displayName: all || local ? `${packageName} (global)`: packageName,
                    global: true
                });
            }
        }

        if(all || local) {
            const projectPath: string = this.environmentService.getProjectPath();
            for(const packageName of await this.getPackagesHelper(projectPath)) {
                packages.push({
                    name: packageName,
                    displayName: packageName,
                    global: false
                });
            }
        }

        packages = packages.sort((a, b) => {
            if(a.name <= b.name) {
                return - 1;
            } else {
                return 1;
            }
        })

        return packages;
    }

    private async getPackagesHelper(projectPath: string): Promise<string[]> {
        const packagesDir: string = getPackagesPath(projectPath);
        if(!await fs.pathExists(packagesDir)) {
            return [];
        }
        const packages: string[] = [];
        const files: string[] = await fs.readdir(packagesDir);
        for(const file of files) {
            const path: string = join(packagesDir, file);
            const isDirectory: boolean = (await fs.lstat(path)).isDirectory();
            const configExists: boolean = await fs.pathExists(join(path, BoilerConstants.PKG_CONFIG_FILENAME));
            if(isDirectory && configExists) {
                packages.push(file);
            }
        }
        return packages;
    }

}