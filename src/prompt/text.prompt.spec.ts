import { assert } from "@app/assert/assert";
import { suite, test } from "mocha-typescript";
import { anyString, instance, mock, verify, when } from "ts-mockito";
import { PromptInterface } from "./prompt-interface";
import { TextPrompt, TextPromptResult } from "./text.prompt";

@suite
export class TextPromptTests {

    private promptInterfaceMock: PromptInterface;
    private textPrompt: TextPrompt;

    before() {
        this.promptInterfaceMock = mock(PromptInterface);
        this.textPrompt = new TextPrompt(() => instance(this.promptInterfaceMock));
    }

    @test
    async testShowPrompt() {
        when(this.promptInterfaceMock.question(anyString())).thenCall(q => {
            assert.include(q, "Enter your dog's name");
            return Promise.resolve("Fido");
        });
        const result: TextPromptResult = await this.textPrompt.show("Enter your dog's name");
        assert.exists(result);
        assert.strictEqual(result.getValue(), "Fido");
        verify(this.promptInterfaceMock.close()).once();
    }

    
    @test
    async testFailToShowPromptWithInvalidMaxTries() {
        const promise: Promise<TextPromptResult> = this.textPrompt.show("Select your choice", { maxRetries: -1 });
        await assert.isRejected(promise, /maxRetries must be at least 0/);
    }

}