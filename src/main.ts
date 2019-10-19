import { argv } from "process";
import { bootstrap } from "./bootstrap";
import { logger } from "./logger";

bootstrap(argv).catch(err => logger.error(err));