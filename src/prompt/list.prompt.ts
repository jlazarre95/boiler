import { parseAnswer, retryPrompt } from "@app/utils/prompt.utils";
import { defaultPromptInterfaceFactory, PromptInterface, PromptInterfaceFactory } from "./prompt-interface";

export class ListPromptResult {
    constructor(private value: string) { }
    getValue(): string {
        return this.value;
    }
}

export interface IShowListOptions {
    maxRetries?: number
}

export class ListPrompt {

    constructor(private factory: PromptInterfaceFactory = defaultPromptInterfaceFactory) {

    }   

    async show(message: string, list: string[], options: IShowListOptions = {}): Promise<ListPromptResult> {
        const { maxRetries = 0 } = options;
        const promptInterface: PromptInterface = this.factory();

        return retryPrompt(async () => {

            let q: string = message + ":\n";
            for(let i = 0; i < list.length; i++) {
                q += `${i+1}) ${list[i]}\n`;
            }
            q += "\n> ";
    
            const ans: string = await promptInterface.question(q); 
            const result = parseAnswer(ans);
    
            if(typeof result === "number") {
                const index: number = result - 1;
                if(index < 0 || index >= list.length) {
                    throw new Error(`That choice does not exist`);
                } else {
                    promptInterface.close();
                    return new ListPromptResult(list[index]);
                }
            } 
            if(list.indexOf(result) < 0) {
                throw new Error(`That choice does not exist`);
            } else {
                promptInterface.close();
                return new ListPromptResult(result);
            }

        }, promptInterface, maxRetries);
    }

}