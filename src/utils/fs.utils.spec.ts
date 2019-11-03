import { assert } from "@app/assert/assert";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { join } from "path";
import { tmpDir } from "./directory.utils";
import { IFile, readFolder } from "./fs.utils";

@suite
export class FsUtilsTests {

    private rootPath: string = tmpDir("boiler-project-fs-utils-tests");

    async before() {
        await fs.ensureDir(this.rootPath);

        // food/
        await fs.ensureDir(join(this.rootPath, "food"));
        await fs.ensureDir(join(this.rootPath, "food", "vegetables"));
        await fs.ensureFile(join(this.rootPath, "food", "vegetables", "carrot.txt"));
        await fs.ensureFile(join(this.rootPath, "food", "vegetables", "lettuce.txt"));
        await fs.ensureDir(join(this.rootPath, "food", "fruits"));
        await fs.ensureFile(join(this.rootPath, "food", "fruits", "apple.txt"));

        // beverages/
        await fs.ensureDir(join(this.rootPath, "beverages"));
        await fs.ensureFile(join(this.rootPath, "beverages", "juice.txt"));
        await fs.ensureFile(join(this.rootPath, "beverages", "water.txt"));
        await fs.ensureDir(join(this.rootPath, "beverages", "alcohol"))

        // nutrition.txt
        await fs.ensureFile(join(this.rootPath, "nutrition.txt"));

    }

    async after() {
        await fs.remove(this.rootPath);
    }

    @test
    async testReadFolder() {
        const files: IFile[] = await readFolder(this.rootPath);
        const paths: string[] = files.map(f => f.path);
        assert.includeOrderedMembers(paths, [
            join(this.rootPath, "beverages"),
            join(this.rootPath, "beverages", "alcohol"),
            join(this.rootPath, "beverages", "juice.txt"),
            join(this.rootPath, "beverages", "water.txt"),
            join(this.rootPath, "food"),
            join(this.rootPath, "food", "fruits"),
            join(this.rootPath, "food", "fruits", "apple.txt"),
            join(this.rootPath, "food", "vegetables"),
            join(this.rootPath, "food", "vegetables", "carrot.txt"),
            join(this.rootPath, "food", "vegetables", "lettuce.txt"),
            join(this.rootPath, "nutrition.txt")
        ]);
    }

    @test
    async testFailToReadFolderWhenMaxDepthIsNegative() {
        const promise: Promise<IFile[]> = readFolder(this.rootPath, { maxDepth: -1 });
        await assert.isRejected(promise, /maxDepth must be nonnegative/);
    }

    @test
    async testReadFolderWhenMaxDepthIsZero() {
        const files: IFile[] = await readFolder(this.rootPath, { maxDepth: 0 });
        const paths: string[] = files.map(f => f.path);
        assert.includeOrderedMembers(paths, []);
    }

    @test
    async testReadFolderWhenMaxDepthIsOne() {
        const files: IFile[] = await readFolder(this.rootPath, { maxDepth: 1 });
        const paths: string[] = files.map(f => f.path);
        assert.includeOrderedMembers(paths, [
            join(this.rootPath, "beverages"),
            join(this.rootPath, "food"),
            join(this.rootPath, "nutrition.txt")
        ]);
    }

    @test
    async testReadFolderWhenMaxDepthIsLessThanDepth() {
        const files: IFile[] = await readFolder(this.rootPath, { maxDepth: 2 });
        const paths: string[] = files.map(f => f.path);
        assert.includeOrderedMembers(paths, [
            join(this.rootPath, "beverages"),
            join(this.rootPath, "beverages", "alcohol"),
            join(this.rootPath, "beverages", "juice.txt"),
            join(this.rootPath, "beverages", "water.txt"),
            join(this.rootPath, "food"),
            join(this.rootPath, "food", "fruits"),
            join(this.rootPath, "food", "vegetables"),
            join(this.rootPath, "nutrition.txt")
        ]);
    }

    @test
    async testReadFolderWhenMaxDepthIsEqualToDepth() {
        const files: IFile[] = await readFolder(this.rootPath, { maxDepth: 3 });
        const paths: string[] = files.map(f => f.path);
        assert.includeOrderedMembers(paths, [
            join(this.rootPath, "beverages"),
            join(this.rootPath, "beverages", "alcohol"),
            join(this.rootPath, "beverages", "juice.txt"),
            join(this.rootPath, "beverages", "water.txt"),
            join(this.rootPath, "food"),
            join(this.rootPath, "food", "fruits"),
            join(this.rootPath, "food", "fruits", "apple.txt"),
            join(this.rootPath, "food", "vegetables"),
            join(this.rootPath, "food", "vegetables", "carrot.txt"),
            join(this.rootPath, "food", "vegetables", "lettuce.txt"),
            join(this.rootPath, "nutrition.txt")
        ]);
    }

    @test
    async testReadFolderWhenMaxDepthIsGreaterThanDepth() {
        const files: IFile[] = await readFolder(this.rootPath, { maxDepth: 4 });
        const paths: string[] = files.map(f => f.path);
        assert.includeOrderedMembers(paths, [
            join(this.rootPath, "beverages"),
            join(this.rootPath, "beverages", "alcohol"),
            join(this.rootPath, "beverages", "juice.txt"),
            join(this.rootPath, "beverages", "water.txt"),
            join(this.rootPath, "food"),
            join(this.rootPath, "food", "fruits"),
            join(this.rootPath, "food", "fruits", "apple.txt"),
            join(this.rootPath, "food", "vegetables"),
            join(this.rootPath, "food", "vegetables", "carrot.txt"),
            join(this.rootPath, "food", "vegetables", "lettuce.txt"),
            join(this.rootPath, "nutrition.txt")
        ]);
    }


}