import { assert } from "@app/assert/assert";
import { BoilerConstants } from "@app/constants";
import { getPackagePath, getPackagesPath } from "@app/utils/directory.utils";
import * as fs from "fs-extra";
import { suite, test } from "mocha-typescript";
import { join } from "path";
import { SimpleGit } from "simple-git/promise";
import { anyString, instance, mock, verify, when } from "ts-mockito";
import { EnvironmentService } from "./environment.service";
import { RegistryService } from "./registry.service";

@suite
export class RegistryServiceTests {

    private registryService: RegistryService;
    private environmentServiceMock: EnvironmentService = mock(EnvironmentService);
    private gitMock: SimpleGit = mock<SimpleGit>();
    private fsMock: typeof fs = mock<typeof fs>();

    before() {
        this.registryService = new RegistryService(
            instance(this.environmentServiceMock),
            instance(this.gitMock),
            instance(this.fsMock)
        );
    }

    @test
    async testClonePackageWithRepoURL() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("/users/johndoe/home/boiler");
        when(this.fsMock.pathExists(anyString())).thenResolve(false);

        await this.registryService.fetchPackage("https://github.com/boiler-team/boiler.git");
        
        verify(this.fsMock.pathExists(getPackagePath("/users/johndoe/home/boiler", "boiler"))).once();
        verify(this.gitMock.cwd(getPackagesPath("/users/johndoe/home/boiler"))).once();
        verify(this.gitMock.clone("https://github.com/boiler-team/boiler.git", undefined)).once();
    }

    @test
    async testClonePackageWithName() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("/users/johndoe/home/boiler");
        when(this.fsMock.pathExists(anyString())).thenResolve(false).thenResolve(true);
        when(this.fsMock.readJSON(anyString())).thenResolve({
            packages: { 
                boiler: { 
                    location: "https://github.com/boiler-team/other-boiler.git"
                }
            }
        });

        await this.registryService.fetchPackage("boiler");
        
        verify(this.gitMock.cwd(getPackagesPath("/users/johndoe/home/boiler"))).once();
        verify(this.gitMock.clone("https://github.com/boiler-team/other-boiler.git", "boiler")).once();
        verify(this.fsMock.pathExists(getPackagePath("/users/johndoe/home/boiler", "boiler"))).once();
        verify(this.fsMock.pathExists(join("/users/johndoe/home/boiler", BoilerConstants.REG_FILENAME))).once();
        verify(this.fsMock.readJSON(join("/users/johndoe/home/boiler", BoilerConstants.REG_FILENAME))).once();
    }

    @test
    async testClonePackageWithNameAndDestPath() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("/users/johndoe/home/boiler");
        when(this.fsMock.pathExists(anyString())).thenResolve(true);
        when(this.fsMock.readJSON(anyString())).thenResolve({
            packages: { 
                boiler: { 
                    location: "https://github.com/boiler-team/boiler.git"
                }
            }
        });

        await this.registryService.fetchPackage("boiler", "my-boiler");

        verify(this.gitMock.cwd(getPackagesPath("/users/johndoe/home/boiler"))).once();
        verify(this.gitMock.clone("https://github.com/boiler-team/boiler.git", "my-boiler")).once();
        verify(this.fsMock.pathExists(join("/users/johndoe/home/boiler", BoilerConstants.REG_FILENAME))).once();
        verify(this.fsMock.readJSON(join("/users/johndoe/home/boiler", BoilerConstants.REG_FILENAME))).once();
    }

    @test
    async testFailToClonePackageWithUnregisteredName() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("/users/johndoe/home/boiler");
        when(this.fsMock.pathExists(anyString())).thenResolve(false).thenResolve(true);
        when(this.fsMock.readJSON(anyString())).thenResolve({ packages: { } });

        const promise: Promise<void> = this.registryService.fetchPackage("boiler");
        await assert.isRejected(promise, /Could not resolve package 'boiler'/);

        verify(this.fsMock.pathExists(getPackagePath("/users/johndoe/home/boiler", "boiler"))).once();
        verify(this.fsMock.pathExists(join("/users/johndoe/home/boiler", BoilerConstants.REG_FILENAME))).once();
        verify(this.fsMock.readJSON(join("/users/johndoe/home/boiler", BoilerConstants.REG_FILENAME))).once();
    }

    @test
    async testFailToClonePackageWithMissingRegistryFile() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("/users/johndoe/home/boiler");
        when(this.fsMock.pathExists(anyString())).thenResolve(false).thenResolve(false);
        
        const promise: Promise<void> = this.registryService.fetchPackage("boiler");
        await assert.isRejected(promise, /Registry file could not be found/);
    
        verify(this.fsMock.pathExists(getPackagePath("/users/johndoe/home/boiler", "boiler"))).once();
        verify(this.fsMock.pathExists(join("/users/johndoe/home/boiler", BoilerConstants.REG_FILENAME))).once();
    }

    @test
    async testPullPackageWithRepoURL() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("/users/johndoe/home/boiler");
        when(this.fsMock.pathExists(anyString())).thenResolve(true);

        await this.registryService.fetchPackage("https://github.com/boiler-team/boiler.git");
                
        verify(this.gitMock.cwd(getPackagePath("/users/johndoe/home/boiler", "boiler"))).once();
        verify(this.gitMock.pull()).once();
        verify(this.fsMock.pathExists(getPackagePath("/users/johndoe/home/boiler", "boiler"))).once();
    }

    @test
    async testPullPackageWithNameAndDestPath() {
        when(this.environmentServiceMock.getBoilerPath()).thenReturn("/users/johndoe/home/boiler");
        when(this.fsMock.pathExists(anyString())).thenResolve(true);
       
        await this.registryService.fetchPackage("my-boiler");
        
        verify(this.gitMock.cwd(getPackagePath("/users/johndoe/home/boiler", "my-boiler"))).once();
        verify(this.gitMock.pull()).once();
        verify(this.fsMock.pathExists(getPackagePath("/users/johndoe/home/boiler", "my-boiler"))).once();
    }

}