import { retryPrompt } from "@app/utils/prompt.utils";
import { PromptInterface } from "./prompt-interface";

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

    constructor(private promptInterface: PromptInterface) {
        
    }

    async show(message: string, options: IShowTextOptions = {}): Promise<TextPromptResult> {
        const { maxRetries = 0 } = options;
        return retryPrompt(async () => {
            let q: string = message + ":\n\n> ";
            const ans: string = await this.promptInterface.question(q); 
            this.promptInterface.close();
            return new TextPromptResult(ans);
        }, this.promptInterface, maxRetries);
    }

}