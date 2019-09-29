import { assert } from "@app/assert/assert";
import { ValidationError } from "class-validator";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { getValidationErrorMessage } from "./validation.utils";

@suite
export class ValidationUtilsTests {

    @test
    async testGetValidationErrorMessage() {
        const errors: ValidationError[] = await fs.readJSON("test/fixtures/validation-errors.json");
        const message: string = getValidationErrorMessage(errors);
        assert.include(message, "$.params.0: name should not be empty");
        assert.include(message, "$.params.0: name must be a string");
        assert.include(message, "$.params.0: type must be one of the following values: positional,optional,virtual");
        assert.include(message, "$.params.0: type should not be empty");
        assert.include(message, "$.params.0: type must be a string");
        assert.include(message, "$.templates: each value in nested property templates must be either object or array");
    }

}