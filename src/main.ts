import { BoilerApp } from "@app/app";
import { BoilerplateGenerator } from "@app/services/boilerplate.generator";
import { DirectoryService } from "@app/services/directory.service";
import { EnvironmentService } from "@app/services/environment.service";
import { ProjectService } from "@app/services/project.service";
import { RegistryService } from "@app/services/registry.service";
import { ScriptRunner } from "@app/services/script.runner";
import * as simplegit from 'simple-git/promise';
import { PromptService } from "./prompt/prompt";
import { ParamResolver } from "./services/param.resolver";

async function main() {
    const environmentService: EnvironmentService = await EnvironmentService.create();
    const packageListingService: DirectoryService = new DirectoryService(environmentService);
    const registryService: RegistryService = new RegistryService(environmentService, simplegit())
    const projectService: ProjectService = new ProjectService();
    const scriptRunner: ScriptRunner = new ScriptRunner();
    const promptService: PromptService = new PromptService();
    const paramResolver: ParamResolver = new ParamResolver(scriptRunner, promptService);
    const boilerplateGenerator: BoilerplateGenerator = new BoilerplateGenerator(paramResolver, scriptRunner);
    const app: BoilerApp = new BoilerApp(environmentService, packageListingService, projectService, registryService, boilerplateGenerator);
    await app.run();
}

main().catch(err => console.error(err));