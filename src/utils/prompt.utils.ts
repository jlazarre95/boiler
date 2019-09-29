import { PromptInterface } from "@app/prompt/prompt-interface";
import { Retries } from "@app/prompt/retries";

export function parseAnswer(ans: string): string | number {
    const val: number = parseInt(ans);
    return isNaN(val) ? ans : val;
}

export async function retryPrompt<T>(fn: (...args: any[]) => T, promptInterface: PromptInterface, maxRetries: number): Promise<T> {
    if(maxRetries === Retries.Indefinite) {
        return doIndefinitePrompt(fn, promptInterface);
    } else {
        return doRetryPrompt(fn, promptInterface, maxRetries);
    }
}

async function doRetryPrompt<T>(fn: (...args: any[]) => T, promptInterface: PromptInterface, maxRetries: number): Promise<T> {
    if(maxRetries < 0) { 
        throw new Error("maxRetries must be at least 0");
    }

    for(let i = 0; i < maxRetries + 1; i++) {
        try {
            const res = await fn();
            return res;
        } catch(err) {
            if(i < maxRetries) { // Not last try.
                await promptInterface.write("\n" + err.message + ". Please try again.\n");
            }
        }
    } 
    promptInterface.close();
    throw new Error(`Max number of retries (${maxRetries}) exceeded.`);
}

async function doIndefinitePrompt<T>(fn: (...args: any[]) => T, promptInterface: PromptInterface): Promise<T> {
    while(true) {
        try {
            const res = await fn();
            return res;
        } catch(err) {
            await promptInterface.write("\n" + err.message + ". Please try again.\n");
        }
    } 
}