import { env } from "process";
import * as fs from "fs-extra";

export class EnvironmentService {
    private boilerPath: string;
    private projectPath: string;

    constructor() {
        this.boilerPath = env["BOILER_PATH"] || "/Users/jahkelll/Projects/global-boiler-assets";
        this.assertEnvPath("BOILER_PATH", this.boilerPath);
        
        this.projectPath = env["PROJECT_PATH"];
        this.assertEnvPath("PROJECT_PATH", this.projectPath);
    }

    getBoilerPath(): string {
        return this.boilerPath;
    }

    getProjectPath(): string {
        return this.projectPath;
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