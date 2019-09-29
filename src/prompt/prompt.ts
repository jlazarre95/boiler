import { IShowListOptions, ListPrompt, ListPromptResult } from "@app/prompt/list.prompt";
import { PromptInterface } from "./prompt-interface";
import { IShowTextOptions, TextPrompt, TextPromptResult } from "./text.prompt";

export class PromptService {

    showList(message: string, list: string[], options?: IShowListOptions): Promise<ListPromptResult> {
        const listPrompt: ListPrompt = new ListPrompt(this.getInterface());
        return listPrompt.show(message, list, options);    
    }

    showText(message: string, options?: IShowTextOptions): Promise<TextPromptResult> {
        const textPrompt: TextPrompt = new TextPrompt(this.getInterface());
        return textPrompt.show(message, options);    
    }

    private getInterface(): PromptInterface {
        return PromptInterface.create(process.stdin, process.stdout);
    }

}

