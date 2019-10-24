import { assert } from "@app/assert/assert";
import { ITemplateParamTable, PackageConfig } from "@app/types/package-config.class";
import { suite, test } from "mocha-typescript";

@suite
export class PackageConfigTests {

    @test
    testFindParam() {
        const packageConfig: PackageConfig = PackageConfig.create({
            params: [
                {
                    name: "name",
                    type: "positional"
                },
                {
                    name: "package",
                    type: "optional"
                }
            ]
        });
        
        const param = packageConfig.findParam("package");
        assert.exists(param);
        assert.strictEqual(param.name, "package");
        assert.strictEqual(param.type, "optional");
    }

    @test
    testFailToFindUndefinedParam() {
        const packageConfig: PackageConfig = PackageConfig.create({
            params: []
        });
        const param = packageConfig.findParam("name");
        assert.notExists(param);
    }

    @test
    testFindTemplate() {
        const packageConfig: PackageConfig = PackageConfig.create({
            templates: [
                {
                    name: "cat",
                    include: ["Cat.java.boiler"]
                },
                {
                    name: "dog",
                    include: ["Dog.java.boiler"]
                }
            ]
        });
        
        const template = packageConfig.findTemplate("cat");
        assert.exists(template);
        assert.strictEqual(template.name, "cat");
        assert.deepEqual(template.include, ["Cat.java.boiler"]);
    }

    @test
    testFailToFindTemplate() {
        const packageConfig: PackageConfig = PackageConfig.create({
            templates: []
        });
        
        const template = packageConfig.findTemplate("cat");
        assert.notExists(template);
    }

    @test
    testGetTemplateParams() {
        const packageConfig: PackageConfig = PackageConfig.create({
            params: [
                {
                    name: "name",
                    type: "positional"
                },
                {
                    name: "package",
                    type: "optional"
                },
            ],
            templates: [
                {
                    name: "cat",
                    require: [
                        "name",
                        {
                            name: "group",
                            type: "optional"
                        }
                    ],
                    include: ["Cat.java.boiler"]
                },
                {
                    name: "dog",
                    include: ["Dog.java.boiler"]
                }
            ]
        });
        const table: ITemplateParamTable = packageConfig.getTemplateParams("cat");
        assert.exists(table);
        assert.exists(table.positionalParam);
        assert.strictEqual(table.positionalParam.name, "name");
        assert.strictEqual(table.positionalParam.type, "positional");
        assert.exists(table.params);
        assert.exists(table.params.name);
        assert.strictEqual(table.params.name.name, "name");
        assert.strictEqual(table.params.name.type, "positional");
        assert.exists(table.params.group);
        assert.strictEqual(table.params.group.name, "group");
        assert.strictEqual(table.params.group.type, "optional");
        assert.strictEqual(table.positionalParam.type, "positional");
    }

    @test
    testFailToGetTemplateParamsWhenTemplateDoesNotExist() {
        const packageConfig: PackageConfig = PackageConfig.create({
            templates: []
        });
        assert.throws(() => packageConfig.getTemplateParams("cat"), /Template not found/);
    }

    @test
    testFailToGetTemplateParamsWhenTemplateRequiresAnUndefinedParam() {
        const packageConfig: PackageConfig = PackageConfig.create({
            params: [
            ],
            templates: [
                {
                    name: "cat",
                    require: [
                        "name",
                    ],
                    include: ["Cat.java.boiler"]
                },
            ]
        });
        assert.throws(() => packageConfig.getTemplateParams("cat"), /Template requires undefined parameter: name/);
    }

    @test
    testFailToGetTemplateParamsWhenTemplateRequiresMultiplePositionalParams() {
        const packageConfig: PackageConfig = PackageConfig.create({
            params: [
                {
                    name: "name",
                    type: "positional"
                },
                {
                    name: "package",
                    type: "positional"
                }
            ],
            templates: [
                {
                    name: "cat",
                    require: [
                        "name",
                        "package"
                    ],
                    include: ["Cat.java.boiler"]
                },
                {
                    name: "dog",
                    include: ["Dog.java.boiler"]
                }
            ]
        });
        assert.throws(() => packageConfig.getTemplateParams("cat"), /Template defines multiple positional parameters/);
    }

    @test
    testFailToCreateWhenInvalid() {
        const obj = {
            params: [
                {
                    name: "param-0",
                    type: "virtual"
                }
            ],
            templates: [
                {
                    name: "template-0",
                    require: [44, "", {}],
                    include: ""
                },
                {
                    name: "template-1",
                    require: "",
                    include: [123, "", {}]
                },
            ]
        };
        try {
            PackageConfig.create(obj);
        } catch(err) {
            assert.match(err.message, /\$\.params\.0: must specify script when param is virtual/);
            assert.match(err.message, /\$\.templates\.0: each value in require should not violate .* should not be an empty string/);
            assert.match(err.message, /\$\.templates\.0: each value in require should not violate .* name should not be empty/);
            assert.match(err.message, /\$\.templates\.0: each value in require should not violate .* name must be a string/);
            assert.match(err.message, /\$\.templates\.0: each value in require should not violate .* type must be one of the following/);
            assert.match(err.message, /\$\.templates\.0: each value in require should not violate .* type must be a string/);
            assert.match(err.message, /\$\.templates\.0: include .* must be an array/);
            assert.match(err.message, /\$\.templates\.1: require .* must be an array/);
            assert.match(err.message, /\$\.templates\.1: each value in include should not violate .* should not be an empty string/);
            assert.match(err.message, /\$\.templates\.1: each value in include should not violate .* name should not be empty/);
            assert.match(err.message, /\$\.templates\.1: each value in include should not violate .* name must be a string/);
            return;
        }
        throw new Error("Expected to throw error");
    }

}