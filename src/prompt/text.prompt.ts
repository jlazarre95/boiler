import { retryPrompt } from "@app/utils/prompt.utils";
import { defaultPromptInterfaceFactory, PromptInterface, PromptInterfaceFactory } from "./prompt-interface";

export class TextPromptResult {
    constructor(private value: string) { }
    getValue(): string {
        return this.value;
    }
}

export interface IShowTextOptions {
    maxRetries?: number
}

export class TextPrompt {

    constructor(private factory: PromptInterfaceFactory = defaultPromptInterfaceFactory) {
        
    }

    async show(message: string, options: IShowTextOptions = {}): Promise<TextPromptResult> {
        const { maxRetries = 0 } = options;
        const promptInterface: PromptInterface = this.factory();
        return retryPrompt(async () => {
            let q: string = message + "\n> ";
            const ans: string = await promptInterface.question(q); 
            promptInterface.close();
            return new TextPromptResult(ans);
        }, promptInterface, maxRetries);
    }

}