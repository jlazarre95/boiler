import { DirectoryService, IPackageListEntry } from "@app/services/directory.service";
import { EnvironmentService } from "@app/services/environment.service";
import { ProjectService } from "@app/services/project.service";
import { RegistryService } from "@app/services/registry.service";
import { argv } from "process";
import { BoilerplateGenerator } from "./services/boilerplate.generator";

export class BoilerApp {

    constructor(private environmentService: EnvironmentService, private packageListingService: DirectoryService,
                private projectService: ProjectService, private registryService: RegistryService, 
                private boilerplateGenerator: BoilerplateGenerator) {
    }

    async run() {
        const args: string[] = argv.slice(3);
        switch(argv[2]) {
            case undefined: 
                break;
            case "path":
                this.printBoilerPath();
                break;
            case "init":
                await this.initializeProject();
                break;
            case "new": 
                switch(args[0]) {
                    case "package": 
                        await this.createPackage(args[1]);
                        break;
                    case "script":
                        await this.createScript(args[1], args[2]);
                        break;
                    case "template":
                        await this.createTemplate(args[1], args[2]);
                        break;
                    default:
                        throw new Error("Unrecognized new command");
                }
            case "ls": {
                if(args.length == 0) {
                    await this.getAllPackages("local");               
                } else if(args.length == 1 && args[0] == "-g") { 
                    await this.getAllPackages("global");              
                } else if(args.length == 1 && args[0] == "-a") {
                    await this.getAllPackages("all");                 
                } else if(args.length == 1) {
                    await this.getPackage(args[0], false);                      
                } else if(args.length == 2 && args[0] == "-g") {
                    await this.getPackage(args[1], true);
                } else {
                    throw new Error("Malformed ls command");
                }
                break;
            }
            case "pull":
                await this.fetchPackage(args[0], args[1]);
                break;
            case "generate":
                if(args[0] == "-g") {
                    await this.generateBoilerplate(args[1], args[2], args.slice(3), true);
                } else {
                    await this.generateBoilerplate(args[0], args[1], args.slice(2), false);
                }
                break;
            case "templatize":
                    await this.templatizePackage(args[0]);
                break;
            default:
                throw new Error("Unrecognized command");
        }
    }

    private printBoilerPath() {
        const boilerPath: string = this.environmentService.getBoilerPath();
        console.log(boilerPath);
    }

    private async initializeProject() {
        const projectPath: string = this.environmentService.getProjectPath();
        await this.projectService.initializeProject(projectPath);
    }

    private async createPackage(name: string) {
        const projectPath: string = this.environmentService.getProjectPath();
        await this.projectService.createPackage(projectPath, name);
    }

    private async createTemplate(packageName: string, templateName: string) {
        const projectPath: string = this.environmentService.getProjectPath();
        await this.projectService.createTemplate(projectPath, packageName, templateName);
    }

    private async createScript(packageName: string, scriptName: string) {
        const projectPath: string = this.environmentService.getProjectPath();
        await this.projectService.createScript(projectPath, packageName, scriptName);
    }

    private async getPackage(name: string, global: boolean) {
        const pkg = await this.packageListingService.getPackageInfo(name, global);
        console.log("Templates\n----------");
        for(const template of pkg.templates) {
            console.log(template);
        }
        console.log("\nScripts\n----------");
        for(const script of pkg.scripts) {
            console.log(script);
        }
    }

    private async getAllPackages(mode: "local" | "global" | "all") {
        const packages: IPackageListEntry[] = await this.packageListingService.getPackageList({ 
            all: mode === "all",
            global: mode === "global",
            local: mode === "local"
        });

        for(const pkg of packages) {
            console.log(`${pkg.displayName}`);
        }
    }

    private async fetchPackage(repository: string, name: string) {
        await this.registryService.fetchPackage(repository, name);
    }

    private async generateBoilerplate(packageName: string, templateName: string, args: string[], global: boolean) {
        const projectPath: string = this.environmentService.getProjectPath();
        const boilerplatePath: string = global ? this.environmentService.getBoilerPath() : this.environmentService.getProjectPath();
        await this.boilerplateGenerator.generateBoilerplate(projectPath, boilerplatePath, packageName, templateName, args);
    }

    private async templatizePackage(packageName: string) {
        const projectPath: string = this.environmentService.getProjectPath();
        await this.projectService.templatizePackage(projectPath, packageName);
    }
}