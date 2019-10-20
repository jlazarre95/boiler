import { suite, test } from "mocha-typescript";
import { env } from "process";
import { bootstrap } from "./bootstrap";

@suite
export class BoostrapSmokeTests {

    @test
    async testBootstrap() {
        env["BOILER_PATH"] = __dirname;
        await bootstrap(["", "", "path"]);
    }

}