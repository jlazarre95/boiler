import * as fs from "fs-extra";
import { join } from "path";

export class PackageService {

    async getPackages(dir: string): Promise<string[]> {
        const packageDir: string = join(dir, "packages");
        if(!await fs.pathExists(packageDir)) {
            return [];
            //throw new Error(`Package directory does not exist: ${packageDir}`);
        }
        const packages: string[] = [];
        const files: string[] = await fs.readdir(packageDir);
        for(const file of files) {
            const path: string = join(packageDir, file);
            const isDirectory: boolean = (await fs.lstat(path)).isDirectory();
            const configExists: boolean = await fs.pathExists(join(path, "boiler.json"));
            if(isDirectory && configExists) {
                packages.push(file);
            }
        }
        return packages;
    }

}