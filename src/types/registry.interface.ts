import { Dict } from "@app/types/dict.type";

export interface IRegistry {
    packages: Dict<string, IRegistryPackage>;
}

export interface IRegistryPackage {
    location: string;
}