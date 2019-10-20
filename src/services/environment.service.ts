import * as fs from "fs-extra";
import { cwd, env } from "process";

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
        this.projectPath = cwd();
    }

    getBoilerPath(): string {
        return this.boilerPath;
    }

    getProjectPath(): string {
        return this.projectPath;
    }

    private async validate() {
        await this.assertEnvPath("BOILER_PATH", this.boilerPath);
    }
    
    private async assertEnvPath(name: string, path: string) {
        if(!path) {
            throw new Error(`${name} must be specified!`);
        }
        if(!await fs.pathExists(path)) {
            throw new Error(`${name} is not a valid path!`);
        }
    }
}