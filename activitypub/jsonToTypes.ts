import { SupportedObjectTypes } from "./types.ts";
import { Note, CreateActivity, Object as APObject, AtContextContext } from "./types.ts";
import { Some, Option, undefinedIfErr } from "../helpers.ts";

function safeUrl(url: unknown): Option<URL> {
    if (url instanceof URL || typeof url === "string") {
        return undefinedIfErr(() => Some(new URL(url)));
    }
    return undefined;
}

function safeDate(date: unknown): Option<Date> {
    if (typeof date !== "string") {
        return undefined;
    }
    const dateRet = new Date(date);
    if (Number.isNaN(dateRet.valueOf())) {
        return undefined;
    }
    return Some(dateRet);
}

function safeMap<T>(arr: unknown, func: (item: unknown) => T): Option<T[]> {
    if (!Array.isArray(arr)) {
        return undefined;
    }

    return Some(arr.map(func));
} 

function flatOptions<T>(val: Option<Option<T>[]>): Option<T[]> {
    if (val === undefined) {
        return undefined;
    }
    const ret = [];

    for (const v of val.data) {
        if (v === undefined) {
            return undefined;
        }
        ret.push(v.data);
    }

    return Some(ret);
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

export function readObject(json: unknown): Option<APObject> {
    if (typeof json === "string") {
        const tmp = json;
        json = undefinedIfErr(() => JSON.parse(tmp));
    }
    if (!isObject(json)) {
        return undefined;
    }

    const context = parseAtContext(json["@context"]) 
    if (context === undefined) {
        return undefined;
    }

    const id = undefinedIfErr(() => safeUrl(json.id))?.data;
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

export function readCreateActivity(jsonStr: string): Option<CreateActivity<APObject>> {
    const asObject = readObject(jsonStr)?.data;
    if (asObject === undefined) {
        return undefined;
    }
    if (asObject.type !== "Create") {
        return undefined;
    }
    const json: unknown = undefinedIfErr(() => JSON.parse(jsonStr));
    if (!isObject(json)) {
        return undefined;
    }
    const actor = safeUrl(json.actor);
    if (actor === undefined) {
        return undefined;
    }
    const published = safeDate(json.published);
    if (published === undefined || Number.isNaN(published?.valueOf())) {
        return undefined;
    }
    const to = flatOptions(safeMap(json.to, (url) => safeUrl(url)));
    if (to === undefined) {
        return undefined;
    }
    const cc = flatOptions(safeMap(json.to, (url) => safeUrl(url)));
    if (cc === undefined) {
        return undefined;
    }
    const object = readObject(json.object);
    if (object === undefined) {
        return undefined;
    }

    return Some({
        ...asObject,
        type: "Create",
        actor: actor.data,
        published: published.data,
        to: to.data,
        cc: cc.data,
        object: object.data
    });
}