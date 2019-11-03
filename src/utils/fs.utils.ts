import { Stats } from "fs";
import * as fs from "fs-extra";
import { join } from "path";

export interface IReadFolderOptions {
    maxDepth?: number;
}

export interface IFile {
    path: string;
    stats: Stats;
}

interface IReadFolderContext {
    depth: number;
}

export async function readFolder(path: string, options: IReadFolderOptions = {}): Promise<IFile[]> {
    if(options.maxDepth < 0)
        throw new Error("maxDepth must be nonnegative");
    return readFolderAux(path, options, { depth: 0 });
}

async function readFolderAux(path: string, options: IReadFolderOptions, context: IReadFolderContext): Promise<IFile[]> {
    if(context.depth >= options.maxDepth)
        return [];

    let files: IFile[] = [];
    for(const p of await fs.readdir(path)) {
        const childPath: string = join(path, p);
        files.push({
            path: childPath,
            stats: await fs.lstat(childPath)
        });
    }

    for(const f of files) {
        if(f.stats.isDirectory()) {
            const moreFiles: IFile[] = await readFolderAux(f.path, options, { depth: context.depth + 1 });
            files = files.concat(moreFiles);
        }
    }

    files = files.sort((a, b) => a.path.localeCompare(b.path));
    return files;
}