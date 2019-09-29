import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fs from "fs-extra";

chai.use(chaiAsPromised);
export const assert = chai.assert;

export async function assertPathExists(path: string) {
    assert.isTrue(await fs.pathExists(path), `Path '${path}' does not exist`);
}

export async function assertPathNotExists(path: string) {
    assert.isFalse(await fs.pathExists(path), `Path '${path}' exists`);
}