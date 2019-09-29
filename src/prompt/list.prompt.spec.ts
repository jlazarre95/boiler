import { assert } from "@app/assert/assert";
import { suite, test } from "mocha-typescript";
import { anyString, instance, mock, verify, when } from "ts-mockito";
import { ListPrompt, ListPromptResult } from "./list.prompt";
import { PromptInterface } from "./prompt-interface";
import { Retries } from "./retries";

@suite
export class ListPromptTests {

    private promptInterfaceMock: PromptInterface;
    private listPrompt: ListPrompt;
    
    before() {
        this.promptInterfaceMock = mock(PromptInterface);
        this.listPrompt = new ListPrompt(instance(this.promptInterfaceMock));
    }

    @test
    async testShowListWithValueAnswer() {
        when(this.promptInterfaceMock.question(anyString())).thenCall(q => {
            assert.include(q, "option 1");
            assert.include(q, "option 2");
            assert.include(q, "option 3");
            return Promise.resolve("option 2");
        });
        const result: ListPromptResult = await this.listPrompt.show("Select your choice", [
            "option 1",
            "option 2",
            "option 3"
        ]);
        assert.exists(result);
        assert.strictEqual(result.getValue(), "option 2");
        verify(this.promptInterfaceMock.close()).once();
    }

    @test
    async testShowListWithValueAnswerAndMultipleRetries() {
        when(this.promptInterfaceMock.question(anyString()))
            .thenCall(q => {
                assert.include(q, "option 1");
                assert.include(q, "option 2");
                assert.include(q, "option 3");
                return Promise.resolve("option -1");
            })
            .thenCall(q => {
                assert.include(q, "option 1");
                assert.include(q, "option 2");
                assert.include(q, "option 3");
                return Promise.resolve("0");
            })
            .thenCall(q => {
                assert.include(q, "option 1");
                assert.include(q, "option 2");
                assert.include(q, "option 3");
                return Promise.resolve("option 1");
            });

        const result: ListPromptResult = await this.listPrompt.show("Select your choice", [
            "option 1",
            "option 2",
            "option 3"
        ], { maxRetries: Retries.Indefinite });
        assert.exists(result);
        assert.strictEqual(result.getValue(), "option 1");
        verify(this.promptInterfaceMock.question(anyString())).thrice();
        verify(this.promptInterfaceMock.write(anyString())).twice();
        verify(this.promptInterfaceMock.close()).once();
    }

    @test
    async testFailShowListWithIndexAnswerAndMultipleRetries() {
        when(this.promptInterfaceMock.question(anyString()))
            .thenCall(q => {
                assert.include(q, "option 1");
                assert.include(q, "option 2");
                assert.include(q, "option 3");
                return Promise.resolve("-2");
            })
            .thenCall(q => {
                assert.include(q, "option 1");
                assert.include(q, "option 2");
                assert.include(q, "option 3");
                return Promise.resolve("option -3");
            })
            .thenCall(q => {
                assert.include(q, "option 1");
                assert.include(q, "option 2");
                assert.include(q, "option 3");
                return Promise.resolve("4");
            });
        const promise: Promise<ListPromptResult> = this.listPrompt.show("Select your choice", [
            "option 1",
            "option 2",
            "option 3"
        ], { maxRetries: 2 });
        await assert.isRejected(promise, /Max number of retries/);
        verify(this.promptInterfaceMock.question(anyString())).thrice();
        verify(this.promptInterfaceMock.write(anyString())).twice();
        verify(this.promptInterfaceMock.close()).once();
    }

    @test
    async testFailToShowListWithInvalidMaxTries() {
        const promise: Promise<ListPromptResult> = this.listPrompt.show("Select your choice", [
            "option 1",
            "option 2",
            "option 3"
        ], { maxRetries: -1 });
        await assert.isRejected(promise, /maxRetries must be at least 0/);
    }

    @test
    async testFailToShowListWithInvalidValueAnswer() {
        when(this.promptInterfaceMock.question(anyString())).thenCall(q => {
            assert.include(q, "option 1");
            assert.include(q, "option 2");
            assert.include(q, "option 3");
            return Promise.resolve("option 4");
        });
        const promise: Promise<ListPromptResult> = this.listPrompt.show("Select your choice", [
            "option 1",
            "option 2",
            "option 3"
        ]);
        await assert.isRejected(promise, /Max number of retries/);
        verify(this.promptInterfaceMock.close()).once();
    }

    @test
    async testShowListWithIndexAnswer() {
        when(this.promptInterfaceMock.question(anyString())).thenCall(q => {
            assert.include(q, "option 1");
            assert.include(q, "option 2");
            assert.include(q, "option 3");
            return Promise.resolve("3");
        });
        const result: ListPromptResult = await this.listPrompt.show("Select your choice", [
            "option 1",
            "option 2",
            "option 3"
        ]);
        assert.exists(result);
        assert.strictEqual(result.getValue(), "option 3");
        verify(this.promptInterfaceMock.close()).once();
    }

    @test
    async testFailToShowListWithInvalidIndexAnswer() {
        when(this.promptInterfaceMock.question(anyString())).thenCall(q => {
            assert.include(q, "option 1");
            assert.include(q, "option 2");
            assert.include(q, "option 3");
            return Promise.resolve("4");
        });
        const promise: Promise<ListPromptResult> = this.listPrompt.show("Select your choice", [
            "option 1",
            "option 2",
            "option 3"
        ]);
        await assert.isRejected(promise, /Max number of retries/);
        verify(this.promptInterfaceMock.close()).once();
    }

}