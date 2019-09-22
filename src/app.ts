import { argv } from "process";
import { PackageService } from "./services/package.service";
import { EnvironmentService } from "./services/environment.service";
import { ProjectService } from "./services/project.service";
import { join } from "path";

/* 
    boiler
    boiler path
    boiler init
    boiler ls
    boiler open <package>
    boiler new package <package>
    boiler new script <script>
    boiler new template <template>
    boiler ls <package>
    boiler get <package>
    boiler get <repo> <package>
    boiler generate <package> <template> <args>
*/

export class BoilerApp {

    constructor(private environmentService: EnvironmentService, private packageService: PackageService,
                private projectService: ProjectService) {

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
            case "ls": 
                if(args[0]) {
                    // List one package.
                } else {
                    // List all packages.
                    await this.listPackages();
                }
                break;
            case "get":
                break;
            case "generate":
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

    // TODO: change name to listGlobalPackages()
    private async listPackages() {
        // ls -> local (if boiler directory doesn't exist, print error)
        // ls -g -> global
        // ls -a -> all

        const boilerPath: string = this.environmentService.getBoilerPath();
        const projectPath: string = this.environmentService.getProjectPath();
        let packages: any[] = [];

        // Get global packages.
        for(const packageName of await this.packageService.getPackages(boilerPath)) {
            packages.push({
                name: packageName,
                global: true,
            });
        }

        // Get local packages.
        for(const packageName of await this.packageService.getPackages(join(projectPath, "boiler"))) {
            packages.push({
                name: packageName,
                global: false,
            });
        }

        // Sort packages by name in ascending order.
        packages = packages.sort((a, b) => {
            if(a.name < b.name) {
                return - 1;
            } else if(a.name == b.name) {
                if(a.global) {
                    return -1;
                }
                else { 
                    return 1;
                }
            } else {
                return 1;
            }
        })

        for(const pkg of packages) {
            const globalLabel: string = pkg.global ? " (global)" : "";
            console.log(`${pkg.name}${globalLabel}`);
        }
    }

}