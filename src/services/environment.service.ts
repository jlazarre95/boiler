import * as fs from "fs-extra";
import { env } from "process";

export class EnvironmentService {
    private boilerPath: string;
    private projectPath: string;

    static async create(): Promise<EnvironmentService> {
        const environmentService: EnvironmentService = new EnvironmentService();
        await environmentService.validate();
        return environmentService;
    }

    private constructor() {
        this.boilerPath = env["BOILER_PATH"];
        this.projectPath = env["PROJECT_PATH"];
    }

    getBoilerPath(): string {
        return this.boilerPath;
    }

    getProjectPath(): string {
        return this.projectPath;
    }

    private async validate() {
        await this.assertEnvPath("BOILER_PATH", this.boilerPath);
        await this.assertEnvPath("PROJECT_PATH", this.projectPath);        
    }
    
    private async assertEnvPath(name: string, path: string) {
        //console.log(name, path, !!path);
        if(!path) {
            throw new Error(`${name} must be specified!`);
        }
        if(!await fs.pathExists(path)) {
            throw new Error(`${name} is not a valid path!`);
        }
    }
}