import { EnvironmentService } from "./services/environment.service";
import { PackageService } from "./services/package.service";
import { BoilerApp } from "./app";
import { ProjectService } from "./services/project.service";

const environmentService: EnvironmentService = new EnvironmentService();
const packageService: PackageService = new PackageService();
const projectService: ProjectService = new ProjectService();
const app: BoilerApp = new BoilerApp(environmentService, packageService, projectService);

app.run().catch(err => console.error(err));