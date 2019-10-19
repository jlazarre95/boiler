import { BoilerConstants } from "@app/constants";
import { EnvironmentService } from "@app/services/environment.service";
import { IRegistry } from "@app/types/registry.interface";
import { getPackagePath, getPackagesPath } from "@app/utils/directory.utils";
import * as fsExtra from "fs-extra";
import { join } from "path";
import * as simplegit from 'simple-git/promise';

export class RegistryService {

    constructor(private environmentService: EnvironmentService, private git: simplegit.SimpleGit, private fs: typeof fsExtra = fsExtra) {
    
    }

    async fetchPackage(target: string, dest?: string) {
        const boilerPath: string = this.environmentService.getBoilerPath();
        const isRepoURL: boolean = this.isRepoURL(target);
        const packageName: string = isRepoURL ? this.getRepoName(target) : target;

        if(!dest && await this.fs.pathExists(getPackagePath(boilerPath, packageName))) {
            // Package path exists, so let's execute a 'git pull' in the package directory.
            await this.pullPackage(boilerPath, packageName);
        } else {
            // Package path does not exist, so we'll need to perform a 'git clone' against the repo URL.
            const registryPath: string = join(boilerPath, BoilerConstants.REG_FILENAME);
            let repoURL: string; 
            if(isRepoURL) {  
                // Target is a repo URL - nothing special to do here.
                repoURL = target;
            } else {  
                // Target is a package name, so let's see if we can find it's repo URL in the registry.
                if(!await this.fs.pathExists(registryPath)) {
                    throw new Error("Registry file could not be found");
                }
                const registry: IRegistry = await this.fs.readJSON(registryPath);
                if(registry && registry.packages && registry.packages[packageName]) {
                    // The registry recognizes the package, so let's get the repo URL from it. Let's change the
                    // destination to the name of the package we're cloning if a destination was not provided.
                    repoURL = registry.packages[packageName].location;
                    dest = dest ? dest : packageName;
                } else {
                    throw new Error(`Could not resolve package '${packageName}'`);
                }
            }
            
            await this.clonePackage(boilerPath, repoURL, dest);    
        }
    }

    private async clonePackage(boilerPath: string, url: string, dest?: string) {
        await this.git.cwd(getPackagesPath(boilerPath));
        await this.git.clone(url, dest);
    }
    
    private async pullPackage(boilerPath: string, name: string) {
        await this.git.cwd(getPackagePath(boilerPath, name));
        await this.git.pull();
    }

    private getRepoName(url: string): string {
        const start: number = url.lastIndexOf("/") + 1;
        const end: number = url.lastIndexOf(".git");
        return url.substr(start, end - start);
    }

    private isRepoURL(target: string): boolean {
        const start: number = target.lastIndexOf("/") + 1;
        const end: number = target.lastIndexOf(".git");
        return start >= 0 && start < end && end === target.length - 4;
    }

}