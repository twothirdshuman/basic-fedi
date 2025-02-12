import { ulid } from "jsr:@std/ulid";
import { Note } from "./activitypub/types.ts";

const kv = await Deno.openKv("kvdb");

export interface User {
    username: string;
}

export interface InboxNote extends InboxMessage{
    type: "Note";
    message: {
        content: string,
        published: string,
        cw: string | null,
        sensative: boolean,
    };
}

export interface InboxMessage {
    message: unknown;
    id: string;
    type: "Note" | "Something Else";
}

export function addToInbox(user: User, message: InboxMessage): Promise<Deno.KvCommitResult> {
    return kv.set(["users", `${user.username}`, "inbox", ulid()], message);
}