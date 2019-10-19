import { assert } from "@app/assert/assert";
import { PackageConfig } from "@app/types/package-config.class";
import { getPackageConfigPath, getScriptPath, getTemplatePath, getTemplatesPath, tmpDir } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { join, resolve } from "path";
import { anyString, anything, capture, deepEqual, instance, mock, verify, when } from "ts-mockito";
import { Logger } from "winston";
import { BoilerplateGenerator } from "./boilerplate.generator";
import { ParamResolver } from "./param.resolver";
import { ScriptRunner } from "./script.runner";

@suite
export class BoilerplateGeneratorTests {
    
    private boilerplateGenerator: BoilerplateGenerator;
    private paramResolverMock: ParamResolver = mock(ParamResolver);
    private scriptRunnerMock: ScriptRunner = mock(ScriptRunner);
    private loggerMock: Logger = mock<Logger>();

    private boilerPath: string = tmpDir("boiler-path");
    private projectPath: string = tmpDir("project-path");

    async before() {
        await fs.ensureDir(this.boilerPath);
        await fs.ensureDir(this.projectPath);
        this.boilerplateGenerator = new BoilerplateGenerator(
            instance(this.paramResolverMock), 
            instance(this.scriptRunnerMock),
            instance(this.loggerMock));
    }

    async after() {
        await fs.remove(this.boilerPath);
        await fs.remove(this.projectPath);
    }

    @test
    async testGenerateBoilerplate() {
        when(this.paramResolverMock.resolveParams(anyString(), anyString(), anyString(), anyString(), anything(), anything()))
            .thenResolve({
                a: "apple",
                b: "boba tea",
                d: "apples",
                e: "lunch",
                f: ""
            });

        when(this.scriptRunnerMock.runScript(anyString(), anyString(), anything()))
            .thenCall((_, __, context) => { 
                context.params.f += "x"; 
                return Promise.resolve(true); 
            });

        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler-complex.json"));
        await fs.mkdirp(getTemplatesPath(this.projectPath, "package-2"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "package-2"), config);
        await fs.writeFile(getTemplatePath(this.projectPath, "package-2", "template-1.txt"), "I just ate an {{a}}.");
        await fs.writeFile(getTemplatePath(this.projectPath, "package-2", "template-2.txt"), "I like to eat {{d}} and drink {{b}} at {{e}}. I mean, I really like {{a}}s!");

        await this.boilerplateGenerator.generateBoilerplate(this.projectPath, this.projectPath, "package-2", "template-2", ["blah", "bleh", "blah"]);
    
        const apple1: string = (await fs.readFile(join(this.projectPath, "2", "apple-2.txt"))).toString();
        const apple2: string = (await fs.readFile(join(this.projectPath, "2", "1", "apple-1.txt"))).toString();
        const apple3: string = (await fs.readFile(join(this.projectPath, "2", "3", "apple-1.txt"))).toString();

        assert.equal(apple1, "I like to eat apples and drink boba tea at lunch. I mean, I really like apples!");
        assert.equal(apple2, "I just ate an apple.");
        assert.equal(apple3, "I just ate an apple.");

        verify(this.paramResolverMock.resolveParams(this.projectPath, this.projectPath, "package-2", "template-2", deepEqual(config), deepEqual(["blah", "bleh", "blah"]))).once();
        
        // Verify that scripts were executed in the correct order and with the correct arguments.
        const scriptExecutionOrder: any[] = await fs.readJSON("test/fixtures/script-execution-order.json");
        for(let i = 0; i < scriptExecutionOrder.length; i++) {
            const [projectPath, scriptPath, context] = capture(this.scriptRunnerMock.runScript).byCallIndex(i);
            const failMessage: string = `Script Execution Order Index: ${i}`;
            assert.equal(projectPath, this.projectPath, failMessage);
            assert.equal(scriptPath, getScriptPath(this.projectPath, "package-2", scriptExecutionOrder[i].path), failMessage);
            assert.equal(resolve(context.outDir), resolve(scriptExecutionOrder[i].outDir), failMessage);
            assert.deepEqual(context.params, {
                a: "apple", 
                b: "boba tea", 
                d: "apples", 
                e: "lunch", 
                f: "xxxxxxxxxxxxxxxxxxxx" // # is 20 since context is a reference
            }, failMessage);
        }
    }

    @test
    async testFailToGenerateBoilerplateWithUndefinedTemplate() {
        when(this.paramResolverMock.resolveParams(anyString(), anyString(), anyString(), anyString(), anything(), anything()))
            .thenResolve({
                a: "apple",
                b: "boba tea",
                d: "apples",
                e: "lunch",
                f: ""
            });

        when(this.scriptRunnerMock.runScript(anyString(), anyString(), anything()))
            .thenCall((_, __, context) => { 
                context.params.f += "x"; 
                return Promise.resolve(true); 
            });

        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler-complex-undefined-template.json"));
        await fs.mkdirp(getTemplatesPath(this.projectPath, "package-2"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "package-2"), config);
        await fs.writeFile(getTemplatePath(this.projectPath, "package-2", "template-1.txt"), "I just ate an {{a}}.");
        await fs.writeFile(getTemplatePath(this.projectPath, "package-2", "template-2.txt"), "I like to eat {{d}} and drink {{b}} at {{e}}. I mean, I really like {{a}}s!");

        const promise: Promise<void> = this.boilerplateGenerator.generateBoilerplate(this.projectPath, this.projectPath, "package-2", "template-2", ["blah", "bleh", "blah"]);
        await assert.isRejected(promise, /Package package-2 does not contain a template called template-4/);

        const apple1: string = (await fs.readFile(join(this.projectPath, "2", "apple-2.txt"))).toString();
        const apple2: string = (await fs.readFile(join(this.projectPath, "2", "1", "apple-1.txt"))).toString();
        const apple3: string = (await fs.readFile(join(this.projectPath, "2", "3", "apple-1.txt"))).toString();

        assert.equal(apple1, "I like to eat apples and drink boba tea at lunch. I mean, I really like apples!");
        assert.equal(apple2, "I just ate an apple.");
        assert.equal(apple3, "I just ate an apple.");

        config.templates[0].outDir = ""; // Expectation is an empty string.
        verify(this.paramResolverMock.resolveParams(this.projectPath, this.projectPath, "package-2", "template-2", deepEqual(config), deepEqual(["blah", "bleh", "blah"]))).once();
        
        // Verify that scripts were executed in the correct order and with the correct arguments.
        const scriptExecutionOrder: any[] = await fs.readJSON("test/fixtures/script-execution-order-failure.json");
        for(let i = 0; i < scriptExecutionOrder.length; i++) {
            const [projectPath, scriptPath, context] = capture(this.scriptRunnerMock.runScript).byCallIndex(i);
            const failMessage: string = `Script Execution Order Index: ${i}`;
            assert.equal(projectPath, this.projectPath, failMessage);
            assert.equal(scriptPath, getScriptPath(this.projectPath, "package-2", scriptExecutionOrder[i].path), failMessage);
            assert.equal(resolve(context.outDir), resolve(scriptExecutionOrder[i].outDir), failMessage);
            assert.deepEqual(context.params, {
                a: "apple", 
                b: "boba tea", 
                d: "apples", 
                e: "lunch", 
                f: "xxxxxxxxxxxxxxxxxx" // # is 18 since context is a reference
            }, failMessage);
        }
    }

}