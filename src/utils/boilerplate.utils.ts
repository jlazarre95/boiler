import { Dict } from "@app/types/dict.type";
import { PackageConfig } from "@app/types/package-config.class";

export function evalString(str: string, params: Dict<string, string>): string {
    let modified: string = str;
    for(const key of Object.keys(params)) {
        modified = modified.replace(new RegExp("{{" + key + "}}", "g"), params[key]);
    }
    return modified;
}

export function evalUrl(url: string, config: PackageConfig, params: Dict<string, string>): string {
    let modifiedUrl: string = url;
    if(config.output && config.output.file) {
        if(config.output.file.replace) {
            // Replace targets.
            for(const r of config.output.file.replace) {
                const replaceValue: string = this.evalString(r.with, params);
                modifiedUrl = modifiedUrl.replace(new RegExp(r.target, "g"), replaceValue);    
            }
        }
    }
    return modifiedUrl;
}