import { SupportedObjectTypes } from "./types.ts";
import { Note, CreateActivity, Object as APObject, AtContextContext, Collection } from "./types.ts";
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

function readURLList(val: unknown): Option<URL[]> {
    return flatOptions(safeMap(val, (url) => safeUrl(url)));
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

// This signature is BS pls fix, caller can choose the wrong type if not pased objectFunc
export function readCreateActivity<T extends APObject>(
    jsonStr: string,
    objectFunc: (json: unknown) => Option<T>
  ): Option<CreateActivity<T>> {   
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
    const to = readURLList(json.to);
    if (to === undefined) {
        return undefined;
    }
    const cc = readURLList(json.cc);
    if (cc === undefined) {
        return undefined;
    }
    const object = objectFunc(json.object);
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

export function readCollection(json: unknown): Option<Collection> {
    if (!isObject(json)) {
        return undefined;
    }
    const asObject = readObject(json)?.data;
    if (asObject === undefined) {
        return undefined;
    }
    if (json.type !== "Collection") {
        return undefined;
    }
    if (typeof json.totalItems !== "number") {
        return undefined;
    }

    return Some({
        ...asObject,
        type: "Collection",
        totalItems: json.totalItems,
        first: json.first
    });
}

export function readNote(json: unknown): Option<Note> {
    if (!isObject(json)) {
        return undefined;
    }
    if (json.type !== "Note") {
        return undefined;
    }
    if (typeof json.summary !== "string" && json.summary !== null) {
        return undefined;
    }
    const summary = json.summary;
    const inReplyTo = (() => {
        if (json.inReplyTo === null) { 
            return Some(null); 
        } 
        return safeUrl(json.inReplyTo);
    })();
    if (inReplyTo === undefined) {
        return undefined;
    }
    const published = safeDate(json.published);
    if (published === undefined) {
        return undefined;
    }
    const url = safeUrl(json.url);
    if (url === undefined) {
        return undefined
    }
    const attributedTo = safeUrl(json.attributedTo);
    if (attributedTo === undefined) {
        return undefined
    }
    const to = readURLList(json.to);
    if (to === undefined) {
        return undefined
    }
    const cc = readURLList(json.cc);
    if (cc === undefined) {
        return undefined;
    }
    if (typeof json.sensative !== "boolean") {
        return undefined;
    }
    const sensative = json.sensative;
    const atomUri = safeUrl(json.atomUri);
    if (atomUri === undefined) {
        return undefined
    }
    const inReplyToAtomUri = (() => {
        if (json.inReplyTo === null) { 
            return Some(null); 
        } 
        return safeUrl(json.inReplyTo);
    })();
    if (inReplyToAtomUri === undefined) {
        return undefined;
    }
    const conversation = json.conversation;
    if (typeof conversation !== "string") {
        return undefined;
    }
    const content = json.content;
    if (typeof content !== "string") {
        return undefined;
    }
    if (!isObject(json.contentMap)) {
        return undefined;
    }
    const contentMap: Map<string, string> = new Map();
    for (const key in json.contentMap) {
        const val = json.contentMap[key];
        if (typeof val !== "string") {
            return undefined;
        }
        contentMap.set(key, val);
    }
    if (!Array.isArray(json.attachment)) {
        return undefined;
    }
    const attachment: never[] = [];
    if (!Array.isArray(json.tag)) {
        return undefined
    }
    const tag: string[] = [];
    for (const tagItem of json.tag) {
        if (typeof tagItem !== "string") {
            return undefined;
        }
        tag.push(tagItem);
    }
    const replies = readCollection(json.replies);
    if (replies === undefined) {
        return undefined;
    }
    const likes = readCollection(json.likes);
    if (likes === undefined) {
        return undefined;
    }
    const shares = readCollection(json.shares);
    if (shares === undefined) {
        return undefined;
    }

    const asObject = readObject(json)?.data;
    if (asObject === undefined) {
        return undefined;
    }

    return Some({
        ...asObject,
        type: "Note",
        summary,
        inReplyTo: inReplyTo?.data,
        published: published.data,
        url: url.data,
        attributedTo: attributedTo.data,
        to: to.data,
        cc: cc.data,
        sensative,
        atomUri: atomUri?.data,
        inReplyToAtomUri: inReplyToAtomUri?.data,
        conversation,
        content,
        contentMap,
        attachment,
        tag,
        replies: replies.data,
        likes: likes.data,
        shares: shares.data
    });
}