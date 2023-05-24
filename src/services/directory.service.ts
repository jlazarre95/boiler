import { BoilerConstants } from "@app/constants";
import { EnvironmentService } from "@app/services/environment.service";
import { assertPackageExists, getPackagePath, getPackagesPath, getScriptsPath, getTemplatesPath } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { realpath } from "fs-extra";
import { join, resolve } from "path";

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

    async linkPackage(path: string, packageName: string) {
        if(!path) {
            path = this.environmentService.getProjectPath();
        }
        if(!packageName) {
            throw new Error("Package must be specified");
        }
        // TODO: check that path is a package?
        if(!(await fs.lstat(path)).isDirectory()) {
            throw new Error("Path is not a directory");
        }
        path = resolve(path);
        await fs.symlink(getPackagePath(path, packageName), getPackagePath(this.environmentService.getBoilerPath(), packageName), "dir");
    }

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
            if(a.name < b.name) {
                return -1;
            } else if(a.name == b.name) {
                return a.global ? -1 : 1;
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
            const packagePath: string = join(packagesDir, file);
            const isSymbolicLink = (await fs.lstat(packagePath)).isSymbolicLink();
            const realPackagePath: string = isSymbolicLink ? await realpath(packagePath) : packagePath;

            // const isDirectory: boolean = (await fs.lstat(path)).isDirectory();
            // console.log(isDirectory);
            const configPath = join(realPackagePath, BoilerConstants.PKG_CONFIG_FILENAME);
            const configExists: boolean = await fs.pathExists(configPath);

            if(configExists) {
                packages.push(file);
            }
        }
        return packages;
    }

}