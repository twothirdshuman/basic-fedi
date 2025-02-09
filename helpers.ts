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