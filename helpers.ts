export type Result<T, U> = {status:"ok",data:T} | {status:"error",data:U};
export function Ok<T, U>(val: T): Result<T, U> { return {status:"ok",data:val}; }
export function Err<T, U>(val: U): Result<T, U> { return {status:"error",data:val}; }
export type Option<T> = {status:"some",data:T} | undefined;
export function Some<T>(val: T): Option<T> { return {status:"some",data:val}; }
export function undefinedIfErr<T>(func: () => T): undefined | T {
    try {
        return func();
    } catch (_err) {
        return undefined;
    }
}
export function safeMap<T>(arr: unknown, func: (item: unknown) => T): Option<T[]> {
    if (!Array.isArray(arr)) {
        return undefined;
    }

    return Some(arr.map(func));
} 

export function flatOptions<T>(val: Option<Option<T>[]>): Option<T[]> {
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
export function isObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === "object" && !!obj;
}