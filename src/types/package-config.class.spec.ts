import { assert } from "@app/assert/assert";
import { ValidationException } from "@app/exceptions/validation.exception";
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
                    include: "Cat.java.boiler"
                },
                {
                    name: "dog",
                    type: "Dog.java.boiler"
                }
            ]
        });
        
        const template = packageConfig.findTemplate("cat");
        assert.exists(template);
        assert.strictEqual(template.name, "cat");
        assert.strictEqual(template.include, "Cat.java.boiler");
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
                    include: "Cat.java.boiler"
                },
                {
                    name: "dog",
                    type: "Dog.java.boiler"
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
                    include: "Cat.java.boiler"
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
                    include: "Cat.java.boiler"
                },
                {
                    name: "dog",
                    type: "Dog.java.boiler"
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
                    name: null,
                    type: 123
                }
            ]
        };
        assert.throws(() => PackageConfig.create(obj), ValidationException);
    }

}