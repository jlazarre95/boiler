import { assert } from "@app/assert/assert";
import { BoilerConstants } from "@app/constants";
import { IBoilerplateContext } from "@app/types/boilerplate-context.interface";
import { Dict } from "@app/types/dict.type";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { tmpdir } from "os";
import { join } from "path";
import { cwd } from "process";
import { ScriptRunner } from "./script.runner";

@suite
export class ScriptRunnerTests {

    private tempDir: string = join(tmpdir(), "boiler-script-runner-tests");
    private scriptPath: string = join(this.tempDir, "script" + BoilerConstants.SCRIPT_EXT);
    private scriptRunner: ScriptRunner;

    async before() {
        await fs.ensureDir(this.tempDir);
        this.scriptRunner = new ScriptRunner();        
    }

    async after() {
        await fs.remove(this.tempDir);
    }

    @test
    async testRunScript() {
        const currentDir: string = cwd();
        await fs.writeFile(this.scriptPath, `
            boiler.params.test = "bacon";
            await fs.readdir(process.cwd());
            boiler.params.test2 = path.join(boiler.cwd, "child");
        `);
        const ctx: IBoilerplateContext = { params: { abc: "test", xyz: "apples" } };
        const result: boolean = await this.scriptRunner.runScript(this.tempDir, this.scriptPath, ctx);
        assert.isTrue(result);
        assert.deepEqual(ctx, { params: { abc: "test", xyz: "apples", test: "bacon", test2: join(this.tempDir, "child") } });
        assert.strictEqual(cwd(), currentDir);
    }

    @test
    async testRunScriptWithUnexpectedEndOfInput() {
        const currentDir: string = cwd();
        await fs.writeFile(this.scriptPath, `
            throw new Error("Unexpected end of input");
        `);
        const ctx: IBoilerplateContext = { params: { abc: "test", xyz: "apples" } };
        const result: boolean = await this.scriptRunner.runScript(this.tempDir, this.scriptPath, ctx);
        assert.isTrue(result);
        assert.deepEqual(ctx, { params: { abc: "test", xyz: "apples" } });
        assert.strictEqual(cwd(), currentDir);
    }

    @test
    async testRunScriptThatDoesNotExist() {
        const currentDir: string = cwd();
        const ctx: IBoilerplateContext = { params: { abc: "test", xyz: "apples" } };
        const result: boolean = await this.scriptRunner.runScript(this.tempDir, this.scriptPath, ctx);
        assert.isFalse(result);
        assert.deepEqual(ctx, { params: { abc: "test", xyz: "apples" } });
        assert.strictEqual(cwd(), currentDir);
    }

    @test
    async testFailToRunFailingScript() {
        const currentDir: string = cwd();
        await fs.writeFile(this.scriptPath, `
            throw new Error("Custom error");
        `);
        const ctx: IBoilerplateContext = { params: { } };
        const promise: Promise<boolean> = this.scriptRunner.runScript(this.tempDir, this.scriptPath, ctx);
        await assert.isRejected(promise, /Script .* failed .* Custom error/);
        assert.strictEqual(cwd(), currentDir);
    }

    @test
    async testRunParamScript() {
        const currentDir: string = cwd();
        const params: Dict<string, string> = { abc: "my short", xyz: "apples" };
        const result: any = await this.scriptRunner.runParamScript(this.tempDir, `
            const value = await Promise.resolve(boiler.string.toPlural("eat " + boiler.params.abc));
            return value;
        `, params);
        assert.strictEqual(result, "eat my shorts");
        assert.deepEqual(params, { abc: "my short", xyz: "apples" });
        assert.strictEqual(cwd(), currentDir);
    }

}