import { parseAnswer, retryPrompt } from "@app/utils/prompt.utils";
import { PromptInterface } from "./prompt-interface";

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

    constructor(private promptInterface: PromptInterface) {
    }

    async show(message: string, list: string[], options: IShowListOptions = {}): Promise<ListPromptResult> {
        const { maxRetries = 0 } = options;
        return retryPrompt(async () => {

            let q: string = message + ":\n\n";
            for(let i = 0; i < list.length; i++) {
                q += `${i+1}) ${list[i]}\n`;
            }
            q += "\n> ";
    
            const ans: string = await this.promptInterface.question(q); 
            const result = parseAnswer(ans);
    
            if(typeof result === "number") {
                const index: number = result - 1;
                if(index < 0 || index >= list.length) {
                    throw new Error(`That choice does not exist`);
                } else {
                    this.promptInterface.close();
                    return new ListPromptResult(list[index]);
                }
            } 
            if(list.indexOf(result) < 0) {
                throw new Error(`That choice does not exist`);
            } else {
                this.promptInterface.close();
                return new ListPromptResult(result);
            }

        }, this.promptInterface, maxRetries);
        // const { maxTries = 1 } = options;
        // if(maxTries < 1) { 
        //     throw new Error("maxTries must be at least 1");
        // }

        // for(let i = 0; i < maxTries; i++) {
        //     try {
        //         const res = await this.showListHelper(message, list);
        //         return res;
        //     } catch(err) {
        //         if(i < maxTries - 1) { // Not last try.
        //             await this.promptInterface.write("\n" + err.message + ". Please try again.\n");
        //         }
        //     }
        // } 
        // this.promptInterface.close();
        // throw new Error(`Max number of tries (${maxTries}) exceeded.`);
    }

    // private async showListHelper(message: string, list: string[]): Promise<ListPromptResult> {
    //     let q: string = message + ":\n\n";
    //     for(let i = 0; i < list.length; i++) {
    //         q += `${i+1}) ${list[i]}\n`;
    //     }
    //     q += "\n> ";

    //     const ans: string = await this.promptInterface.question(q); 
    //     const result = parseAnswer(ans);

    //     if(typeof result === "number") {
    //         const index: number = result - 1;
    //         if(index < 0 || index >= list.length) {
    //             throw new Error(`That choice does not exist`);
    //         } else {
    //             this.promptInterface.close();
    //             return new ListPromptResult(list[index]);
    //         }
    //     } 
    //     if(list.indexOf(result) < 0) {
    //         throw new Error(`That choice does not exist`);
    //     } else {
    //         this.promptInterface.close();
    //         return new ListPromptResult(result);
    //     }
    // }

}