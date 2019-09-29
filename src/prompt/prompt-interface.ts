import { createInterface, Interface } from "readline";

export class PromptInterface {

    private interface: Interface;

    static create(readStream: NodeJS.ReadStream, writeStream: NodeJS.WriteStream): PromptInterface {
        return new PromptInterface(readStream, writeStream);
    }

    private constructor(private readStream: NodeJS.ReadStream, private writeStream: NodeJS.WriteStream) {
        this.interface = createInterface({
            input: readStream,
            output: writeStream,
            terminal: true
        });
    }

    question(q: string): Promise<string> {
        return new Promise((resolve) => {
            this.interface.question(q, (ans: string) => { 
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
        this.interface.close();
    }

}