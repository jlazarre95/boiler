import { Dict } from "@app/types/dict.type";

export interface IBoilerplateContext {
    params: Dict<string, string>;
    outDir?: string;
}