import { BoilerConstants } from "@app/constants";
import { EnvironmentService } from "@app/services/environment.service";
import { IRegistry } from "@app/types/registry.interface";
import { getPackagePath, getPackagesPath } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { join } from "path";
import * as simplegit from 'simple-git/promise';

export class RegistryService {

    constructor(private environmentService: EnvironmentService, private git: simplegit.SimpleGit) {

    }

    async fetchPackage(repository: string, name?: string) {
        const boilerPath: string = this.environmentService.getBoilerPath();

        const start: number = repository.lastIndexOf("/") + 1;
        const end: number = repository.lastIndexOf(".git");
        if(!name && start >= 0 && start < end && end === repository.length - 4 ) {
            // If a Git repo URL was given but not a package name, let's parse the package name from the URL. If the 
            // package with that name already exists, we will execute a 'git pull'. Otherwise, the package does not 
            // exist, so we will execute a 'git clone'.
            repository = repository.substr(start, end - start);
        } 

        if(await fs.pathExists(getPackagePath(boilerPath, repository))) {
            await this.pullPackage(repository); // repository is package name here.
        } else {
            await this.clonePackage(repository, name);    
        }
    }

    private async clonePackage(target: string, name?: string) {
        const boilerPath: string = this.environmentService.getBoilerPath();
        const registryPath: string = join(boilerPath, BoilerConstants.REG_FILENAME);
        const registry: IRegistry = await fs.readJSON(registryPath);
        if(registry && registry.packages && registry.packages[target]) {
            target = registry.packages[target].location;
        } 
        await this.git.cwd(getPackagesPath(boilerPath));
        await this.git.clone(target, name);
    }
    
    private async pullPackage(name: string) {
        const boilerPath: string = this.environmentService.getBoilerPath();
        await this.git.cwd(getPackagePath(boilerPath, name));
        await this.git.pull();
    }

}