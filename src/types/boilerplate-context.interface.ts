import { Dict } from "@app/types/dict.type";

export interface IBoilerplateContext {
    params: Dict<string, string>;
    hardcodedParams?: Dict<string, string>;
    outDir?: string;
}