import { assert } from "@app/assert/assert";
import { BoilerConstants } from "@app/constants";
import { getPackageConfigPath, getPackagePath, getScriptPath, getScriptsPath, getTemplatePath, getTemplatesPath, tmpDir } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { instance, mock, when } from "ts-mockito";
import { DirectoryService, IPackageInfo, IPackageListEntry } from "./directory.service";
import { EnvironmentService } from "./environment.service";

@suite
export class DirectoryServiceTests {

    private directoryService: DirectoryService;
    private environmentService: EnvironmentService = mock(EnvironmentService);

    private boilerPath: string = tmpDir("boiler-path");
    private projectPath: string = tmpDir("project-path");

    async before() {
        await fs.ensureDir(this.boilerPath);
        await fs.ensureDir(this.projectPath);
        this.directoryService = new DirectoryService(instance(this.environmentService));
        when(this.environmentService.getBoilerPath()).thenReturn(this.boilerPath);
        when(this.environmentService.getProjectPath()).thenReturn(this.projectPath);
    }

    async after() {
        await fs.remove(this.boilerPath);
        await fs.remove(this.projectPath);
    }

    @test
    async testGetGlobalPackageInfo() {
        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package"), {});
        await fs.mkdirp(getTemplatesPath(this.boilerPath, "my-package"));
        await fs.mkdirp(getScriptsPath(this.boilerPath, "my-package"));

        await fs.writeFile(getTemplatePath(this.boilerPath, "my-package", "template-1.txt"), "");
        await fs.writeFile(getTemplatePath(this.boilerPath, "my-package", "template-2.txt"), "");
        await fs.writeFile(getScriptPath(this.boilerPath, "my-package", "script-1"), "");
        await fs.writeFile(getScriptPath(this.boilerPath, "my-package", "script-2"), "");
        await fs.writeFile(getScriptPath(this.boilerPath, "my-package", "script-3"), "");

        const packageInfo: IPackageInfo = await this.directoryService.getPackageInfo("my-package", true);
        assert.deepEqual(packageInfo, {
            templates: [
                "template-1.txt" + BoilerConstants.TEMPLATE_EXT, 
                "template-2.txt" + BoilerConstants.TEMPLATE_EXT
            ],
            scripts: [
                "script-1" + BoilerConstants.SCRIPT_EXT, 
                "script-2" + BoilerConstants.SCRIPT_EXT, 
                "script-3" + BoilerConstants.SCRIPT_EXT
            ]
        });
    }

    @test
    async testGetLocalPackageInfo() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await fs.mkdirp(getTemplatesPath(this.projectPath, "my-package"));
        await fs.mkdirp(getScriptsPath(this.projectPath, "my-package"));

        await fs.writeFile(getTemplatePath(this.projectPath, "my-package", "my-template-1.txt"), "");
        await fs.writeFile(getTemplatePath(this.projectPath, "my-package", "my-template-2.txt"), "");
        await fs.writeFile(getScriptPath(this.projectPath, "my-package", "my-script-1"), "");
        await fs.writeFile(getScriptPath(this.projectPath, "my-package", "my-script-2"), "");
        await fs.writeFile(getScriptPath(this.projectPath, "my-package", "my-script-3"), "");

        const packageInfo: IPackageInfo = await this.directoryService.getPackageInfo("my-package");
        assert.deepEqual(packageInfo, {
            templates: [
                "my-template-1.txt" + BoilerConstants.TEMPLATE_EXT, 
                "my-template-2.txt" + BoilerConstants.TEMPLATE_EXT
            ],
            scripts: [
                "my-script-1" + BoilerConstants.SCRIPT_EXT, 
                "my-script-2" + BoilerConstants.SCRIPT_EXT, 
                "my-script-3" + BoilerConstants.SCRIPT_EXT
            ]
        });
    }

    @test
    async testFailToGetPackageInfoWhenPackageDoesNotExist() {
        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package"));
        const promise: Promise<IPackageInfo> = this.directoryService.getPackageInfo("my-package", true);
        await assert.isRejected(promise, /Not a package/);
    }

    @test
    async testGetPackageList() {
        console.log(this.boilerPath);
        console.log(this.projectPath);
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-1"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-1"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-2"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-2"), {});

        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-4"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-4"), {});

        const expectedPackages: IPackageListEntry[] = [ 
            { 
                name: 'my-package-1',
                displayName: 'my-package-1',
                global: false 
            },
            { 
                name: 'my-package-2',
                displayName: 'my-package-2 (global)',
                global: true 
            },
            { 
                name: 'my-package-3',
                displayName: 'my-package-3 (global)',
                global: true 
            },
            { 
                name: 'my-package-3',
                displayName: 'my-package-3',
                global: false 
            },
            { 
                name: 'my-package-4',
                displayName: 'my-package-4 (global)',
                global: true 
            } 
        ];

        let packages: IPackageListEntry[];

        packages = await this.directoryService.getPackageList({ all: true });
        assert.deepEqual(packages, expectedPackages);

        packages = await this.directoryService.getPackageList({ global: true, local: true });
        assert.deepEqual(packages, expectedPackages);
    }

    
    @test
    async testGetPackageListWhenLocalPackagesPathDoesNotExist() {
        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-2"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-2"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-4"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-4"), {});

        const packages: IPackageListEntry[] = await this.directoryService.getPackageList({ all: true });
        assert.deepEqual(packages, [           
            { 
                name: 'my-package-2',
                displayName: 'my-package-2 (global)',
                global: true 
            },
            { 
                name: 'my-package-3',
                displayName: 'my-package-3 (global)',
                global: true 
            },
            { 
                name: 'my-package-4',
                displayName: 'my-package-4 (global)',
                global: true 
            } 
        ]);
    }

    @test
    async testGetGlobalPackageList() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-1"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-1"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-2"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-2"), {});

        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-4"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-4"), {});

        const packages: IPackageListEntry[] = await this.directoryService.getPackageList({ global: true });
        assert.deepEqual(packages, [ 
            { 
                name: 'my-package-2',
                displayName: 'my-package-2',
                global: true 
            },
            { 
                name: 'my-package-3',
                displayName: 'my-package-3',
                global: true 
            },
            { 
                name: 'my-package-4',
                displayName: 'my-package-4',
                global: true 
            } 
        ]);
    }

    @test
    async testGetLocalPackageList() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-1"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-1"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-2"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-2"), {});

        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-4"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-4"), {});

        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-5")); // No package config.

        const packages: IPackageListEntry[] = await this.directoryService.getPackageList({ local: true });
        assert.deepEqual(packages, [ 
            { 
                name: 'my-package-1',
                displayName: 'my-package-1',
                global: false 
            },
            { 
                name: 'my-package-3',
                displayName: 'my-package-3',
                global: false 
            }
        ]);
    }

    @test
    async testGetEmptyPackageList() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-1"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-1"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-2"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-2"), {});

        await fs.mkdirp(getPackagePath(this.projectPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-3"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-3"), {});

        await fs.mkdirp(getPackagePath(this.boilerPath, "my-package-4"));
        await fs.writeJSON(getPackageConfigPath(this.boilerPath, "my-package-4"), {});

        const packages: IPackageListEntry[] = await this.directoryService.getPackageList();
        assert.deepEqual(packages, []);
    }

}