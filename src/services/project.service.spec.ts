import { assert, assertPathExists, assertPathNotExists } from "@app/assert/assert";
import { BoilerConstants } from "@app/constants";
import { getPackageConfigPath, getPackagePath, getPackagesPath, getProjectBoilerPath, getScriptPath, getScriptsPath, getTemplatePath, getTemplatesPath, tmpDir } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { join } from "path";
import { ProjectService } from "./project.service";

@suite
export class ProjectServiceTests {
    
    private projectPath: string = tmpDir("boiler-project-service-tests");
    private projectService: ProjectService;

    async before() {
        await fs.ensureDir(this.projectPath);
        this.projectService = new ProjectService();
    }

    async after() {
        await fs.remove(this.projectPath);
    }

    @test
    async testInitializeProject() {
        await this.projectService.initializeProject(this.projectPath);
        await assertPathExists(getProjectBoilerPath(this.projectPath));
    }

    @test
    async testInitializeProjectWhenItIsInitialized() {
        await fs.mkdir(getProjectBoilerPath(this.projectPath));
        await this.projectService.initializeProject(this.projectPath);
        await assertPathExists(getProjectBoilerPath(this.projectPath));
    }

    @test
    async testFailToInitializeProjectWhenItDoesNotExist() {
        const promise: Promise<void> = this.projectService.initializeProject("$987238?7#:ssdsfj!!!sdf");
        await assert.isRejected(promise, /Project directory does not exist/);
    }

    @test
    async testCreatePackage() {
        await this.projectService.createPackage(this.projectPath, "my-package");
        await assertPathExists(getProjectBoilerPath(this.projectPath));
        await assertPathExists(getPackagesPath(this.projectPath));
        await assertPathExists(getPackagePath(this.projectPath, "my-package"));
        await assertPathExists(getPackageConfigPath(this.projectPath, "my-package"));
    }

    @test
    async testCreatePackageWhenProjectIsInitialized() {
        await fs.mkdir(getProjectBoilerPath(this.projectPath));
        await this.projectService.createPackage(this.projectPath, "my-package");
        await assertPathExists(getProjectBoilerPath(this.projectPath));
        await assertPathExists(getPackagesPath(this.projectPath));
        await assertPathExists(getPackagePath(this.projectPath, "my-package"));
        await assertPathExists(getPackageConfigPath(this.projectPath, "my-package"));
    }

    @test
    async testCreatePackageWhenPackagesFolderExists() {
        await fs.mkdirp(getPackagesPath(this.projectPath));
        await this.projectService.createPackage(this.projectPath, "my-package");
        await assertPathExists(getPackagePath(this.projectPath, "my-package"));
        await assertPathExists(getPackageConfigPath(this.projectPath, "my-package"));
    }

    @test
    async testFailToCreatePackageWhenProjectDoesNotExist() {
        const promise: Promise<void> = this.projectService.createPackage("$987238?7#:ssdsfj!!!sdf", "my-package");
        await assert.isRejected(promise, /Project directory does not exist/);
    }

    @test
    async testFailToCreatePackageWhenDirectoryExists() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        const promise: Promise<void> = this.projectService.createPackage(this.projectPath, "my-package");
        await assert.isRejected(promise, /Directory already exists/);
    }

    @test
    async testCreateTemplate() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {
            templates: [],
        });
        await this.projectService.createTemplate(this.projectPath, "my-package", "my-template.txt");
        await assertPathExists(getTemplatesPath(this.projectPath, "my-package"));
        await assertPathExists(getTemplatePath(this.projectPath, "my-package", "my-template.txt"));
        const packageConfig: any = await fs.readJSON(getPackageConfigPath(this.projectPath, "my-package"));
        assert.deepEqual(packageConfig, {
            templates: [
                {
                    name: "my-template.txt",
                    include: `my-template.txt${BoilerConstants.TEMPLATE_EXT}`
                }
            ]
        });
    }

    @test
    async testCreateTemplateWhenTemplatesFolderExists() {
        await fs.mkdirp(getTemplatesPath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {
            templates: null,
        });
        await this.projectService.createTemplate(this.projectPath, "my-package", "my-template.txt");
        await assertPathExists(getTemplatePath(this.projectPath, "my-package", "my-template.txt"));
        const packageConfig: any = await fs.readJSON(getPackageConfigPath(this.projectPath, "my-package"));
        assert.deepEqual(packageConfig, {
            templates: [
                {
                    name: "my-template.txt",
                    include: `my-template.txt${BoilerConstants.TEMPLATE_EXT}`
                }
            ]
        });
    }

    @test
    async testCreateTemplateWhenNameContainsExtension() {
        await fs.mkdirp(getTemplatesPath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {
            templates: [],
        });
        await this.projectService.createTemplate(this.projectPath, "my-package", "my-template.txt" + BoilerConstants.TEMPLATE_EXT);
        await assertPathExists(getTemplatesPath(this.projectPath, "my-package"));
        await assertPathExists(getTemplatePath(this.projectPath, "my-package", "my-template.txt"));
        const packageConfig: any = await fs.readJSON(getPackageConfigPath(this.projectPath, "my-package"));
        assert.deepEqual(packageConfig, {
            templates: [
                {
                    name: "my-template.txt",
                    include: `my-template.txt${BoilerConstants.TEMPLATE_EXT}`
                }
            ]
        });
    }

    @test
    async testFailToCreateTemplateWhenProjectDoesNotExist() {
        const promise: Promise<void> = this.projectService.createTemplate("$987238?7#:ssdsfj!!!sdf", "my-package", "my-template.txt");
        await assert.isRejected(promise, /Project directory does not exist/);
    }

    @test
    async testFailToCreateTemplateWhenPackageDoesNotExist() {
        const promise: Promise<void> = this.projectService.createTemplate(this.projectPath, "my-package", "my-template.txt");
        await assert.isRejected(promise, /Package does not exist/);
    }

    @test
    async testFailToCreateTemplateWhenPackageIsInvalid() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        const promise: Promise<void> = this.projectService.createTemplate(this.projectPath, "my-package", "my-template.txt");
        await assert.isRejected(promise, /Not a package/);
    }

    @test
    async testFailToCreateTemplateWhenItExists() {
        await fs.mkdirp(getTemplatesPath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await fs.writeFile(getTemplatePath(this.projectPath, "my-package", "my-template.txt"), "");
        const promise: Promise<void> = this.projectService.createTemplate(this.projectPath, "my-package", "my-template.txt");
        await assert.isRejected(promise, /Template already exists/);
    }

    @test
    async testCreateScript() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await this.projectService.createScript(this.projectPath, "my-package", "my-script");
        await assertPathExists(getScriptsPath(this.projectPath, "my-package"));
        await assertPathExists(getScriptPath(this.projectPath, "my-package", "my-script"));
    }

    @test
    async testCreateScriptWhenScriptsFolderExists() {
        await fs.mkdirp(getScriptsPath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await this.projectService.createScript(this.projectPath, "my-package", "my-script");
        await assertPathExists(getScriptsPath(this.projectPath, "my-package"));
        await assertPathExists(getScriptPath(this.projectPath, "my-package", "my-script"));
    }

    @test
    async testCreateScriptWhenNameContainsExtension() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await this.projectService.createScript(this.projectPath, "my-package", "my-script" + BoilerConstants.SCRIPT_EXT);
        await assertPathExists(getScriptsPath(this.projectPath, "my-package"));
        await assertPathExists(getScriptPath(this.projectPath, "my-package", "my-script"));
    }

    @test
    async testFailToCreateScriptWhenProjectDoesNotExist() {
        const promise: Promise<void> = this.projectService.createScript("$987238?7#:ssdsfj!!!sdf", "my-package", "my-script");
        await assert.isRejected(promise, /Project directory does not exist/);    
    }

    @test
    async testFailToCreateScriptWhenPackageDoesNotExist() {
        const promise: Promise<void> = this.projectService.createScript(this.projectPath, "my-package", "my-script");
        await assert.isRejected(promise, /Package does not exist/);    
    }

    @test
    async testFailToCreateScriptWhenPackageIsInvalid() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        const promise: Promise<void> = this.projectService.createScript(this.projectPath, "my-package", "my-script");
        await assert.isRejected(promise, /Not a package/);    
    }

    @test
    async testFailToCreateScriptWhenItExists() {
        await fs.mkdirp(getScriptsPath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await fs.writeFile(getScriptPath(this.projectPath, "my-package", "my-script"), "");
        const promise: Promise<void> = this.projectService.createScript(this.projectPath, "my-package", "my-script");
        await assert.isRejected(promise, /Script already exists/);    
    }

    @test
    async testTemplatizePackage() {
        await fs.mkdirp(getTemplatesPath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});

        // Write template files without .boiler extension.
        await fs.writeFile(join(getTemplatesPath(this.projectPath, "my-package"), "my-template-1.txt"), "");
        await fs.writeFile(join(getTemplatesPath(this.projectPath, "my-package"), "my-template-2.txt"), "");
        await fs.writeFile(join(getTemplatesPath(this.projectPath, "my-package"), "my-template-3.txt" + BoilerConstants.TEMPLATE_EXT), "");
        await assertPathNotExists(getTemplatePath(this.projectPath, "my-package", "my-template-1.txt"));
        await assertPathNotExists(getTemplatePath(this.projectPath, "my-package", "my-template-2.txt"));
        await assertPathExists(getTemplatePath(this.projectPath, "my-package", "my-template-3.txt"));

        // Templatize and assert files are renamed to have .boiler extension.
        await this.projectService.templatizePackage(this.projectPath, "my-package");
        await assertPathExists(getTemplatePath(this.projectPath, "my-package", "my-template-1.txt"));
        await assertPathExists(getTemplatePath(this.projectPath, "my-package", "my-template-2.txt"));
        await assertPathExists(getTemplatePath(this.projectPath, "my-package", "my-template-3.txt"));
    }

    @test
    async testTemplatizePackageWhenTemplatesFolderDoesNotExist() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await this.projectService.templatizePackage(this.projectPath, "my-package");
    }

    @test
    async testTemplatizePackageWhenTemplatesFolderIsEmpty() {
        await fs.mkdirp(getTemplatesPath(this.projectPath, "my-package"));
        await fs.writeJSON(getPackageConfigPath(this.projectPath, "my-package"), {});
        await this.projectService.templatizePackage(this.projectPath, "my-package");
    }

    @test
    async testFailToTemplatizePackageWhenProjectDoesNotExist() {
        const promise: Promise<void> = this.projectService.templatizePackage("$987238?7#:ssdsfj!!!sdf", "my-package");
        await assert.isRejected(promise, /Project directory does not exist/);    
    }

    @test
    async testFailToTemplatizePackageWhenPackageDoesNotExist() {
        const promise: Promise<void> = this.projectService.templatizePackage(this.projectPath, "my-package");
        await assert.isRejected(promise, /Package does not exist/);    
    }

    @test
    async testFailToTemplatizePackageWhenPackageIsInvalid() {
        await fs.mkdirp(getPackagePath(this.projectPath, "my-package"));
        const promise: Promise<void> = this.projectService.templatizePackage(this.projectPath, "my-package");
        await assert.isRejected(promise, /Not a package/);    
    }

}