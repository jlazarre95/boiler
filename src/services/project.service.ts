import * as fs from "fs-extra";
import { join } from "path";

export class ProjectService {

    async initializeProject(dir: string): Promise<string> {
        if(!await fs.pathExists(dir)) {
            throw new Error(`Project directory does not exist: ${dir}`);
        }
        const boilerDir: string = join(dir, "boiler");
        if(!await fs.pathExists(boilerDir)) {
            await fs.mkdir(boilerDir);
        }
        const packagesDir: string = join(boilerDir, "packages");
        if(!await fs.pathExists(packagesDir)) {
            await fs.mkdir(packagesDir);
        }        
        return boilerDir;
    }
    
}