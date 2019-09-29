import { assert } from "@app/assert/assert";
import { suite, test } from "mocha-typescript";
import { toCamelCase, toPascalCase } from "./string.utils";

@suite
export class StringUtilsTests {

    @test
    testToPascalCase() {
        assert.equal(toPascalCase(""), "");
        assert.equal(toPascalCase("test"), "Test");
        assert.equal(toPascalCase("test-me-now-dude"), "TestMeNowDude");
    }

    @test
    testToCamelCase() {
        assert.equal(toCamelCase(""), "");
        assert.equal(toCamelCase("test"), "test");
        assert.equal(toCamelCase("test-me-now-dude"), "testMeNowDude");
    }

}