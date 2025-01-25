import { ulid } from "jsr:@std/ulid";

const kv = await Deno.openKv("kvdb");

export interface User {
    username: string;
}

export interface InboxMessage {
    message: unknown;
}

export function addToInbox(user: User, message: InboxMessage): Promise<Deno.KvCommitResult> {
    return kv.set(["users", `${user.username}`, "inbox", ulid()], message);
}