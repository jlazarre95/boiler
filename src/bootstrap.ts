import { BoilerApp } from "@app/boiler.app";
import { BoilerplateGenerator } from "@app/services/boilerplate.generator";
import { DirectoryService } from "@app/services/directory.service";
import { EnvironmentService } from "@app/services/environment.service";
import { ParamResolver } from "@app/services/param.resolver";
import { ProjectService } from "@app/services/project.service";
import { RegistryService } from "@app/services/registry.service";
import { ScriptRunner } from "@app/services/script.runner";
import * as simplegit from 'simple-git/promise';
import { logger } from "./logger";
import { TextPrompt } from "./prompt/text.prompt";

export async function bootstrap(argv: string[]) {
    const environmentService: EnvironmentService = await EnvironmentService.create();
    const directoryService: DirectoryService = new DirectoryService(environmentService);
    const registryService: RegistryService = new RegistryService(environmentService, simplegit())
    const projectService: ProjectService = new ProjectService();
    const scriptRunner: ScriptRunner = new ScriptRunner();
    const textPrompt: TextPrompt = new TextPrompt();
    const paramResolver: ParamResolver = new ParamResolver(scriptRunner, textPrompt);
    const boilerplateGenerator: BoilerplateGenerator = new BoilerplateGenerator(paramResolver, scriptRunner, logger);
    
    const app: BoilerApp = new BoilerApp(environmentService, directoryService, projectService, registryService, 
        boilerplateGenerator, logger);

    await app.run(argv);
}