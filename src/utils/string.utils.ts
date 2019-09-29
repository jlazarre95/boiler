import * as pluralize from "pluralize";

export function toPascalCase(str: string): string {
    return str.replace(/[a-zA-Z].*?(?:-|\b)/g, ($0: string) => { 
        const hasDash: boolean = $0.length >= 2 && $0.charAt($0.length - 1) === "-";
        const end: number = hasDash ? $0.length - 1 : $0.length;
        return $0.charAt(0).toUpperCase() + $0.slice(1, end);
    });
}

export function toCamelCase(str: string): string {
    return str.replace(/-([a-zA-Z]).*?/g, (_: string, $1: string) => $1.toUpperCase());
}

export function toPlural(str: string) {
    return pluralize(str);
}