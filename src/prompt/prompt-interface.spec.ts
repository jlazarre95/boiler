import { assert } from "@app/assert/assert";
import { suite, test } from "mocha-typescript";
import { Interface } from "readline";
import { anyFunction, anyString, anything, instance, mock, verify, when } from "ts-mockito";
import { createPromptInterface, defaultPromptInterfaceFactory, PromptInterface } from "./prompt-interface";

@suite
export class PromptInterfaceTests {

    private interfaceMock: Interface = mock(Interface);
    private writeStreamMock: NodeJS.WriteStream = mock<NodeJS.WriteStream>();

    private promptInterface: PromptInterface;

    before() {
        this.promptInterface = createPromptInterface({ 
            interface: instance(this.interfaceMock), 
            writeStream: instance(this.writeStreamMock) 
        });
    }

    @test
    async testQuestion() {
        when(this.interfaceMock.question(anyString(), anyFunction())).thenCall((q, cb)=> {
            cb("apples");
        });
        const result = await this.promptInterface.question("Enter a value");
        assert.equal(result, "apples");
        verify(this.interfaceMock.question("Enter a value", anyFunction())).once();
    }

    @test
    async testWrite() {
        when(this.writeStreamMock.write(anything(), anyFunction())).thenCall((buffer, cb)=> {
            cb();
        });
        await this.promptInterface.write("test 123");
        verify(this.writeStreamMock.write("test 123", anyFunction())).once();
    }

    @test
    async testFailToWrite() {
        when(this.writeStreamMock.write(anything(), anyFunction())).thenCall((buffer, cb)=> {
            cb(new Error("Custom Error"));
        });
        const promise: Promise<void> = this.promptInterface.write("test 123");
        await assert.isRejected(promise, /Custom Error/);
        verify(this.writeStreamMock.write("test 123", anyFunction())).once();
    }

    @test
    async testClose() {
        this.promptInterface.close();
        verify(this.interfaceMock.close()).once();
    }

    @test
    async testDefaultPromptFactoryDoesNotThrow() {
        const promptInterface: PromptInterface = defaultPromptInterfaceFactory();
        assert.exists(promptInterface);
        promptInterface.close();
    }

}