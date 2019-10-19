import { assert } from "@app/assert/assert";
import { BoilerConstants } from "@app/constants";
import { Retries } from "@app/prompt/retries";
import { TextPrompt, TextPromptResult } from "@app/prompt/text.prompt";
import { Dict } from "@app/types/dict.type";
import { PackageConfig } from "@app/types/package-config.class";
import { getScriptsPath } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { join } from "path";
import { anyString, anything, instance, mock, verify, when } from "ts-mockito";
import { ParamResolver } from "./param.resolver";
import { ScriptRunner } from "./script.runner";

@suite
export class ParamResolverTests {
    
    private paramResolver: ParamResolver;
    private scriptRunnerMock: ScriptRunner = mock(ScriptRunner);
    private textPromptMock: TextPrompt = mock(TextPrompt);
    private fsMock: typeof fs = mock<typeof fs>();

    before() {
        this.paramResolver = new ParamResolver(
            instance(this.scriptRunnerMock),
            instance(this.textPromptMock),
            instance(this.fsMock)
        );
    }

    @test
    async testResolveParamsWithCustomPrompt() {
        // b
        const expectedPromptScriptPath: string = join(getScriptsPath("path/to/boiler", "my-package"), `b-prompt${BoilerConstants.SCRIPT_EXT}`);
        when(this.fsMock.pathExists(expectedPromptScriptPath)).thenResolve(true);
        when(this.scriptRunnerMock.runScript(anyString(), anyString(), anything())).thenCall((projectPath, promptScriptPath, context) => {
            assert.deepEqual(context.params, { 
                a: "apple",
                c: "corn",
                d: "dates" 
            });
            context.params["b"] = "butter";
            return Promise.resolve(true);
        });

        // e
        when(this.textPromptMock.show(anyString(), anything())).thenCall((message, options) => { 
            assert.match(message, /Enter a value .* 'e'.*/);
            assert.deepEqual(options, { maxRetries: Retries.Indefinite });
            return Promise.resolve(new TextPromptResult("edamame"));
        });
        
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler.json"));
        const result: Dict<string, string> = await this.paramResolver.resolveParams("path/to/project", "path/to/boiler", 
            "my-package", "my-template", config, ["--c", "corn", "apple", "--d", "dates"]);
        
        assert.deepEqual(result, {
            a: "apple",
            b: "butter",
            c: "corn",
            d: "dates",
            e: "edamame"
        });

        verify(this.scriptRunnerMock.runScript("path/to/project", expectedPromptScriptPath, anything())).once();
    }

    @test
    async testResolveParamsWithParamScript() {
        when(this.textPromptMock.show(anyString(), anything()))
            .thenCall((message, options) => { 
                // a
                assert.match(message, /Enter a value .* 'a'.*/);
                assert.deepEqual(options, { maxRetries: Retries.Indefinite });
                return Promise.resolve(new TextPromptResult("apple"));
            }).thenCall((message, options) => { 
                // e
                assert.match(message, /Enter a value .* 'e'.*/);
                assert.deepEqual(options, { maxRetries: Retries.Indefinite });
                return Promise.resolve(new TextPromptResult("edamame"));
            });
            
        // d
        when(this.scriptRunnerMock.runParamScript(anyString(), anyString(), anything())).thenCall((projectPath, script, params) => {
            assert.deepEqual(params, { 
                a: "apple",
                b: "butter",
                c: "corn" 
            });            
            return Promise.resolve("apples");
        });
        
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler-param-script.json"));
        const result: Dict<string, string> = await this.paramResolver.resolveParams("path/to/project", "path/to/boiler", 
            "my-package", "my-template", config, ["--c", "corn", "--b", "butter"]);
        
        assert.deepEqual(result, {
            a: "apple",
            b: "butter",
            c: "corn",
            d: "apples",
            e: "edamame"
        });
 
        verify(this.scriptRunnerMock.runParamScript("path/to/project", "return boiler.string.toPlural(boiler.params.a)", anything())).once();
    }

    @test
    async testFailToResolveParamsWhenParamScriptDoesNotReturnParameterValue() {
        // d
        when(this.scriptRunnerMock.runParamScript(anyString(), anyString(), anything())).thenCall((projectPath, script, params) => {
            assert.deepEqual(params, { 
                a: "apple",
                b: "butter",
                c: "corn" 
            });            
            return Promise.resolve();
        });

        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler-no-param-script-return-value.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, ["apple", "--b", "butter", "--c", "corn"]);   
        await assert.isRejected(promise, /Param script did not return a value for parameter 'd': boiler.string.toPlural\(boiler.params.a\)/);
    }

    @test
    async testFailToResolveParamsWhenCustomPromptDoesNotSetParameterValue() {
        // b
        const expectedPromptScriptPath: string = join(getScriptsPath("path/to/boiler", "my-package"), `b-prompt${BoilerConstants.SCRIPT_EXT}`);
        when(this.fsMock.pathExists(expectedPromptScriptPath)).thenResolve(true);
        when(this.scriptRunnerMock.runScript(anyString(), anyString(), anything())).thenCall((projectPath, promptScriptPath, context) => {
            assert.deepEqual(context.params, { 
                a: "apple",
            });
            return Promise.resolve(true);
        });

        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, ["apple"]);   
        await assert.isRejected(promise, /Custom prompt did not set a value for parameter 'b'/);
    }

    @test
    async testFailToResolveParamsWithUnknownOptionalArgument() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, ["apple", "--b", "butter", "--c", "corn", "--p", "peanuts"]);   
        await assert.isRejected(promise, /Unknown optional argument: p/);
    }

    @test
    async testFailToResolveParamsWhenExpectingOptionalArgument() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, ["--a", "apple"]);   
        await assert.isRejected(promise, /Not an optional argument: a \(positional\)/);
    }

    @test
    async testFailToResolveParamsWithMissingOptionalArgumentValue() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, ["apple", "--b"]);   
        await assert.isRejected(promise, /No value found for optional argument: b/);
    }

    @test
    async testFailToResolveParamsWithMultiplePositionalArguments() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, ["apple", "butter"]);   
        await assert.isRejected(promise, /Multiple positional arguments are not allowed/);
    }

    @test
    async testFailToResolveParamsWithUnsupportedPositionalArguments() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler-no-positional-params.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, ["--a", "apple", "--b", "butter", "corn"]);   
        await assert.isRejected(promise, /This template does not support positional arguments: corn/);
    }

    @test
    async testFailToResolveParamsWithUndefinedTemplate() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "undefined-template", config, ["--a", "apple", "--b", "butter", "corn"]);   
        await assert.isRejected(promise, /Template not found/);
    }

    @test
    async testFailToResolveParamsWithUndefinedParameter() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler-undefined-param.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, []);   
        await assert.isRejected(promise, /Template requires undefined parameter: z/);
    }

    @test
    async testFailToResolveParamsWithMultiplePositionalParameters() {
        const config: PackageConfig = PackageConfig.create(await fs.readJSON("test/fixtures/boiler-multiple-positional-params.json"));
        const promise: Promise<Dict<string, string>> = this.paramResolver.resolveParams("path/to/project", "path/to/boiler",
            "my-package", "my-template", config, []);   
        await assert.isRejected(promise, /Template defines multiple positional parameters/);
    }

}