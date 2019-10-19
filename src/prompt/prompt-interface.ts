import { createInterface, Interface } from "readline";

export class PromptInterfaceOptions {
    interface: Interface;
    writeStream: NodeJS.WriteStream;
}

export function createPromptInterface(options: PromptInterfaceOptions): PromptInterface {
    return PromptInterface.create(options);
}

export function defaultPromptInterface(): PromptInterface {
    return createPromptInterface({
        interface: createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        }),
        writeStream: process.stdout
    });
}

export interface PromptInterfaceFactory {
    (): PromptInterface;
}

export const defaultPromptInterfaceFactory: PromptInterfaceFactory = () => defaultPromptInterface();

export class PromptInterface {

    private constructor(private int: Interface, private writeStream: NodeJS.WriteStream) {
    }

    static create(options: PromptInterfaceOptions) {
        return new PromptInterface(options.interface, options.writeStream); 
    }

    question(q: string): Promise<string> {
        return new Promise((resolve) => {
            this.int.question(q, (ans: string) => { 
                resolve(ans);
            });
        });
    }

    async write(buffer: string): Promise<void> {
        await new Promise((resolve, reject) => {
            this.writeStream.write(buffer, (err => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            }));
        });    
    }

    close() {
        this.int.write("\n");
        this.int.close();
    }

}