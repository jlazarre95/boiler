import { suite, test } from "mocha-typescript";
import { env } from "process";
import { logger } from "./logger";

@suite()
export class LoggerSmokeTests {

    before() {
        delete env["BOILER_VERBOSE"];
    }

    @test
    testLogInfo() {
        logger.info("message");
    }

    @test
    testLogError() {
        logger.error("message");
    }

    @test
    testLogErrorJSON() {
        logger.error(new Error("hey what is going on"));
    }

    @test
    testLogErrorJSONWithStacktrace() {
        env["BOILER_VERBOSE"] = "True";
        logger.error(new Error("hey what is going on"));
    }

}