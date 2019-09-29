import { assert } from "@app/assert/assert";
import { Dict } from "@app/types/dict.type";
import { PackageConfig } from "@app/types/package-config.class";
import { evalString, evalUrl } from "@app/utils/boilerplate.utils";
import { suite, test } from "mocha-typescript";

@suite
export class BoilerplateUtilsTests {

    @test
    testEvalString() {
        const params: Dict<string, string> = {};
        params.name = "John Doe";
        params.color = "blue";
        const result: string = evalString("Hello, {{name}}! Is light-{{color}}, your favorite color, {{name}}? Btw, {{this}} shouldn't be substituted.", params);
        assert.strictEqual(result, "Hello, John Doe! Is light-blue, your favorite color, John Doe? Btw, {{this}} shouldn't be substituted.");
    }

    @test
    testEvalUrl() {
        const config: PackageConfig = PackageConfig.create({
            output: {
                file: {
                    replace: [
                        {
                            "target": "Cat",
                            "with": "{{name}}"
                        },
                        {
                            "target": "\\.boiler$",
                            "with": ""
                        }
                    ]
                }
            }
        });
        const result: string = evalUrl("CatRepository.java.boiler", config, { name: "Dog", xyz: "test" });
        assert.strictEqual(result, "DogRepository.java");
    }

    @test
    testEvalUrlWithoutOutputRules() {
        const config: PackageConfig = PackageConfig.create();
        const result: string = evalUrl("CatRepository.java.boiler", config, { name: "Dog", xyz: "test" });
        assert.strictEqual(result, "CatRepository.java.boiler");
    }

}