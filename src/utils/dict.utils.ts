import { Dict } from "@app/types/dict.type";

export function joinDicts(...dicts: Dict<string, any>[]): Dict<string, any> {
    const result: Dict<string, any> = {};
    if(dicts) {
        for(const dict of dicts) {
            for(const key in dict) {
                result[key] = dict[key];
            }
        }
    }
    return result;
}