import { suite, test } from "mocha-typescript";
import { anyString, anything, capture, deepEqual, instance, mock, verify, when } from "ts-mockito";
import { Logger } from "winston";
import { assert } from "./assert/assert";
import { BoilerApp } from "./boiler.app";
import { BoilerplateGenerator } from "./services/boilerplate.generator";
import { DirectoryService } from "./services/directory.service";
import { EnvironmentService } from "./services/environment.service";
import { ProjectService } from "./services/project.service";
import { RegistryService } from "./services/registry.service";

@suite
export class BoilerAppTests {

    private boilerApp: BoilerApp;

    private environmentServiceMock: EnvironmentService = mock(EnvironmentService);
    private directoryServiceMock: DirectoryService = mock(DirectoryService);
    private projectServiceMock: ProjectService = mock(ProjectService);
    private registryServiceMock: RegistryService = mock(RegistryService);
    private boilerplateGeneratorMock: BoilerplateGenerator = mock(BoilerplateGenerator);
    private loggerMock: Logger = mock<Logger>();

    before() {
        this.boilerApp = new BoilerApp(
            instance(this.environmentServiceMock),
            instance(this.directoryServiceMock),
            instance(this.projectServiceMock),
            instance(this.registryServiceMock),
            instance(this.boilerplateGeneratorMock),
            instance(this.loggerMock)
        );  
    }

    @test
    async testRunWithoutArguments() {
        await this.boilerApp.run(["", ""]);
    }

    @test
    async testPrintBoilerPath() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("path/to/boiler");
        await this.boilerApp.run(["", "", "path"]);
        verify(this.loggerMock.info("path/to/boiler")).once();
    }

    @test
    async testInitializeProject() {
        when(this.environmentServiceMock.getProjectPath()).thenReturn("path/to/project");
        await this.boilerApp.run(["", "", "init"]);
        verify(this.projectServiceMock.initializeProject("path/to/project")).once();
    }

    @test
    async testCreatePackage() {
        when(this.environmentServiceMock.getProjectPath()).thenReturn("path/to/project");
        await this.boilerApp.run(["", "", "new", "package", "my-package"]);
        verify(this.projectServiceMock.createPackage("path/to/project", "my-package")).once();
    }

    @test
    async testCreateTemplate() {
        when(this.environmentServiceMock.getProjectPath()).thenReturn("path/to/project");
        await this.boilerApp.run(["", "", "new", "template", "my-package", "my-template"]);
        verify(this.projectServiceMock.createTemplate("path/to/project", "my-package", "my-template")).once();
    }

    @test
    async testCreateScript() {
        when(this.environmentServiceMock.getProjectPath()).thenReturn("path/to/project");
        await this.boilerApp.run(["", "", "new", "script", "my-package", "my-script"]);
        verify(this.projectServiceMock.createScript("path/to/project", "my-package", "my-script")).once();
    }

    @test
    async testFailToRunUnrecognizedNewCommand() {
        const promise = this.boilerApp.run(["", "", "new", "random", "my-package", "my-script"]);
        await assert.isRejected(promise, /Unrecognized new/);
    }

    @test
    async testGetLocalPackageInfo() {
        when(this.directoryServiceMock.getPackageInfo(anyString(), anything())).thenResolve({
            templates: [
                "template-1.txt.boiler",
                "template-2.txt.boiler"
            ],
            scripts: [
                "script-1.js",
                "script-2.js",
                "script-3.js"
            ]
        });

        await this.boilerApp.run(["", "", "ls", "my-package"]);
        
        verify(this.directoryServiceMock.getPackageInfo("my-package", false)).once();
    
        let expectedLogs: RegExp[] = [
            /Templates/,
            /template-1\.txt\.boiler/,
            /template-2\.txt\.boiler/,
            /Scripts/,
            /script-1\.js/,
            /script-2\.js/,
            /script-3\.js/
        ];
        for(let i = 0; i < expectedLogs.length; i++) {
            let [log] = capture(this.loggerMock.info).byCallIndex(i);
            assert.match(log as any, expectedLogs[i], `Position: ${i}`);
        }
    }

    @test
    async testGetGlobalPackageInfo() {
        when(this.directoryServiceMock.getPackageInfo(anyString(), anything())).thenResolve({
            templates: [
                "template-1.txt.boiler",
                "template-2.txt.boiler"
            ],
            scripts: [
                "script-1.js",
                "script-2.js",
                "script-3.js"
            ]
        });

        await this.boilerApp.run(["", "", "ls", "-g", "my-package"]);
        
        verify(this.directoryServiceMock.getPackageInfo("my-package", true)).once();
    
        let expectedLogs: RegExp[] = [
            /Templates/,
            /template-1\.txt\.boiler/,
            /template-2\.txt\.boiler/,
            /Scripts/,
            /script-1\.js/,
            /script-2\.js/,
            /script-3\.js/
        ];
        for(let i = 0; i < expectedLogs.length; i++) {
            let [log] = capture(this.loggerMock.info).byCallIndex(i);
            assert.match(log as any, expectedLogs[i], `Position: ${i}`);
        }
    }

    @test
    async testListLocalPackages() {
        when(this.directoryServiceMock.getPackageList(anything())).thenResolve([
            {
                name: "package-1",
                displayName: "Package 1",
                global: false,
            },
            {
                name: "package-2",
                displayName: "Package 2",
                global: false,
            },
            {
                name: "package-3",
                displayName: "Package 3",
                global: false,
            }
        ]);
        
        await this.boilerApp.run(["", "", "ls"]);
        
        verify(this.directoryServiceMock.getPackageList(deepEqual({
            all: false,
            global: false,
            local: true
        }))).once();
        
        let log: any;

        [log] = capture(this.loggerMock.info).byCallIndex(0);
        assert.equal(log, "Package 1");

        [log] = capture(this.loggerMock.info).byCallIndex(1);
        assert.equal(log, "Package 2");

        [log] = capture(this.loggerMock.info).byCallIndex(2);
        assert.equal(log, "Package 3");
    }

    @test
    async testListGlobalPackages() {
        when(this.directoryServiceMock.getPackageList(anything())).thenResolve([
            {
                name: "package-1",
                displayName: "Package 1",
                global: true,
            },
            {
                name: "package-2",
                displayName: "Package 2",
                global: true,
            },
            {
                name: "package-3",
                displayName: "Package 3",
                global: true,
            }
        ]);
        
        await this.boilerApp.run(["", "", "ls", "-g"]);
        
        verify(this.directoryServiceMock.getPackageList(deepEqual({
            all: false,
            global: true,
            local: false
        }))).once();
        
        let log: any;

        [log] = capture(this.loggerMock.info).byCallIndex(0);
        assert.equal(log, "Package 1");

        [log] = capture(this.loggerMock.info).byCallIndex(1);
        assert.equal(log, "Package 2");

        [log] = capture(this.loggerMock.info).byCallIndex(2);
        assert.equal(log, "Package 3");
    }

    @test
    async testGetAllPackages() {
        when(this.directoryServiceMock.getPackageList(anything())).thenResolve([
            {
                name: "package-1",
                displayName: "Package 1",
                global: true,
            },
            {
                name: "package-2",
                displayName: "Package 2 (global)",
                global: true,
            },
            {
                name: "package-3",
                displayName: "Package 3",
                global: true,
            }
        ]);
        
        await this.boilerApp.run(["", "", "ls", "-a"]);
        
        verify(this.directoryServiceMock.getPackageList(deepEqual({
            all: true,
            global: false,
            local: false
        }))).once();
        
        let log: any;

        [log] = capture(this.loggerMock.info).byCallIndex(0);
        assert.equal(log, "Package 1");

        [log] = capture(this.loggerMock.info).byCallIndex(1);
        assert.equal(log, "Package 2 (global)");

        [log] = capture(this.loggerMock.info).byCallIndex(2);
        assert.equal(log, "Package 3");
    }

    @test
    async testFailToRunMalformedListCommand() {
        const promise = this.boilerApp.run(["", "", "ls", "abc", "xyz"]);
        await assert.isRejected(promise, /Malformed ls/);
    }    

    @test
    async testPullPackage() {
        await this.boilerApp.run(["", "", "pull", "https://path/to/repo.git", "my-package"]);
        verify(this.registryServiceMock.fetchPackage("https://path/to/repo.git", "my-package")).once();
    }

    @test
    async testGenerateLocalBoilerplate() {
        when(this.environmentServiceMock.getProjectPath()).thenReturn("path/to/project");
        
        await this.boilerApp.run(["", "", "generate", "my-package", "my-template", "--arg-1", "value-1", "value-2", 
            "--arg-3", "value-3"]);
        
        verify(this.boilerplateGeneratorMock.generateBoilerplate("path/to/project", "path/to/project", "my-package", 
            "my-template", deepEqual(["--arg-1", "value-1", "value-2", "--arg-3", "value-3"]))).once();
    }

    @test
    async testGenerateGlobalBoilerplate() {
        when(this.environmentServiceMock.getProjectPath()).thenReturn("path/to/project");
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("path/to/boiler");
        
        await this.boilerApp.run(["", "", "generate", "-g", "my-package", "my-template", "--arg-1", "value-1", 
            "value-2", "--arg-3", "value-3"]);
        
        verify(this.boilerplateGeneratorMock.generateBoilerplate("path/to/project", "path/to/boiler", "my-package", 
            "my-template", deepEqual(["--arg-1", "value-1", "value-2", "--arg-3", "value-3"]))).once();    
    }

    @test
    async testTemplatizePackage() {
        when(this.environmentServiceMock.getProjectPath()).thenReturn("path/to/project");
        await this.boilerApp.run(["", "", "templatize", "my-package"]);
        verify(this.projectServiceMock.templatizePackage("path/to/project", "my-package")).once();
    }

    @test
    async testFailToRunUnrecognizedCommand() {
        const promise = this.boilerApp.run(["", "", "zzzzzz", "abc", "xyz"]);
        await assert.isRejected(promise, /Unrecognized command/);
    }

}