import { ConsoleColors } from "@app/console/console-colors";
import { ListPrompt } from "@app/prompt/list.prompt";
import { TextPrompt } from "@app/prompt/text.prompt";
import { IBoilerplateContext } from "@app/types/boilerplate-context.interface";
import { Dict } from "@app/types/dict.type";
import * as fsUtils from "@app/utils/fs.utils";
import * as stringUtils from "@app/utils/string.utils";
import * as child_process from "child_process";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as process from "process";
import * as safeEval from "safe-eval";
import * as url from "url";
import * as util from "util";

export class ScriptRunner {

    async runScript(projectPath: string, scriptPath: string, context: IBoilerplateContext): Promise<boolean> {
        if(await(fs.pathExists(scriptPath))) {
            try {
                await this.runScriptFile(projectPath, scriptPath, context.params);
            } catch(err) {
                throw new Error(`Script '${path.basename(scriptPath)}' failed with the following error: ${err}`);
            } 
            return true;
        } else {
            return false;
        }
    }

    runParamScript(projectPath: string, code: string, params: Dict<string, string>): Promise<any> {
        return this.runScriptCode(projectPath, code, params);
    }
    
    private async runScriptFile(projectPath: string, scriptPath: string, params: Dict<string, string>): Promise<any> {
        const code: string = (await fs.readFile(scriptPath)).toString();
        return this.runScriptCode(projectPath, code, params);
    }

    private async runScriptCode(projectPath: string, code: string, params: Dict<string, string>): Promise<any> {
        code = `(async () => { 
            ${code}
        })();`;

        // Change current directory to project path before script runs.
        const prevDir: string = process.cwd();
        const cwd: string = projectPath;
        await process.chdir(cwd);
        
        let result: any;
        try {
            // Run script.
            result = await safeEval(code, {
                boiler: { 
                    Colors: ConsoleColors,
                    params: params,
                    string: stringUtils,
                    fs: fsUtils,
                    cwd: cwd,
                    prompt: {
                        ListPrompt: ListPrompt,
                        TextPrompt: TextPrompt
                    }
                },
                child_process: child_process,
                console: console,
                fs: fs,
                os: os,
                path: path,
                process: process,
                url: url,
                util: util
            });
        } catch(err) {
            if(err.message !== "Unexpected end of input") {
                await process.chdir(prevDir); // Revert current directory.
                throw err;
            }
        }
        await process.chdir(prevDir); // Revert current directory.
        return result;
    }

}

