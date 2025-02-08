import { SupportedObjectTypes } from "./types.ts";
import { Note, CreateActivity, Object as APObject, AtContextContext } from "./types.ts";

// type Result<T, U> = {status:"ok",data:T} | {status:"error",data:U};
type Option<T> = {status:"some",data:T} | undefined;
function Some<T>(val: T): Option<T> { return {status:"some",data:val}; }

function undefinedIfErr<T>(func: () => T): undefined | T {
    try {
        return func();
    } catch (_err) {
        return undefined;
    }
}

function isObject(obj: unknown): obj is Record<string, unknown> {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

function parseAtContext(atContext: unknown): Option<AtContextContext | AtContextContext[]> {
    const parseOneContext = (oneContext: unknown): Option<AtContextContext> => {
        if (typeof oneContext === "string") {
            return undefinedIfErr(() => Some(new URL(oneContext)));
        }
        if (isObject(oneContext)) {
            const map: Map<string, URL> = new Map();
            return undefinedIfErr(() => {
                Object.keys(oneContext).forEach((key) => {
                    // @ts-ignore: URL accepts all types and errors if wrong here we catch the error
                    map.set(key, new URL(oneContext[key]));
                });
                return Some(map);
            });
        }
        return undefined;
    };

    if (!Array.isArray(atContext)) {
        return parseOneContext(atContext);
    }

    const ret: AtContextContext[] = [];
    for (const val of atContext) {
        const toPush = parseOneContext(val);
        if (toPush === undefined) {
            return undefined;
        }
        ret.push(toPush.data);
    }
    return Some(ret);
}

function parseObjectType(val: unknown): Option<SupportedObjectTypes> {
    if (typeof val !== "string") {
        return undefined;
    }

    const supportedObjectTypes = `"Delete" | "Accept" | "Create" | "Note" | "Collection"`;
    const asList = [...supportedObjectTypes.matchAll(/"([^"]+)"/g)].map(m => m[1]); // chatGPT regex magic

    const result = asList.find(s => s == val);
    if (result === undefined) {
        return undefined;
    }

    return Some(result as SupportedObjectTypes);
}

export function readObject(jsonStr: string): Option<APObject> {
    const json = undefinedIfErr(() => JSON.parse(jsonStr));
    if (json === undefined) {
        return undefined;
    }

    const context = parseAtContext(json["@context"]) 
    if (context === undefined) {
        return undefined;
    }

    const id = undefinedIfErr(() => new URL(json.id));
    if (id === undefined) {
        return undefined;
    }

    const objectType = parseObjectType(json.type);
    if (objectType === undefined) {
        return undefined;
    }

    return Some({
        "@context": context.data,
        "id": id,
        "type": objectType.data
    });
}