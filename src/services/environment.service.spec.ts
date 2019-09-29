import { assert } from "@app/assert/assert";
import { EnvironmentService } from "@app/services/environment.service";
import { suite, test } from "mocha-typescript";
import { env } from "process";

@suite
export class EnvironmentServiceTests {

    before() {
        delete env["BOILER_PATH"];
        delete env["PROJECT_PATH"];
    }

    @test
    async testGetBoilerPath() {
        env["BOILER_PATH"] = __dirname;
        env["PROJECT_PATH"] = __dirname;
        const environmentService: EnvironmentService = await EnvironmentService.create();
        const boilerPath: string = environmentService.getBoilerPath();
        assert.strictEqual(boilerPath, __dirname);
    }

    @test
    async testGetProjectPath() {
        env["BOILER_PATH"] = __dirname;
        env["PROJECT_PATH"] = __dirname;
        const environmentService: EnvironmentService = await EnvironmentService.create();
        const projectPath: string = environmentService.getProjectPath();
        assert.strictEqual(projectPath, __dirname);
    }

    @test
    async testFailToCreateEnvironmentServiceWithNoBoilerPath() {
        env["PROJECT_PATH"] = __dirname;
        await assert.isRejected(EnvironmentService.create(), "BOILER_PATH must be specified");
    }

    @test
    async testFailToCreateEnvironmentServiceWithNoProjectPath() {
        env["BOILER_PATH"] = __dirname;
        await assert.isRejected(EnvironmentService.create(), "PROJECT_PATH must be specified");
    }

    @test
    async testFailToCreateEnvironmentServiceWithInvalidBoilerPath() {
        env["BOILER_PATH"] = "zzzzzzzzzzz";
        env["PROJECT_PATH"] = __dirname;
        await assert.isRejected(EnvironmentService.create(), "BOILER_PATH is not a valid path");
    }

    @test
    async testFailToCreateEnvironmentServiceWithInvalidProjectPath() {
        env["BOILER_PATH"] = __dirname;
        env["PROJECT_PATH"] = "zzzzzzzzzzz";
        await assert.isRejected(EnvironmentService.create(), "PROJECT_PATH is not a valid path");
    }

}