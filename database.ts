import { ulid } from "jsr:@std/ulid";
import { Note } from "./activitypub/types.ts";
import { KV_URI } from "./config.ts";

const kv = await Deno.openKv(KV_URI);

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
    type: "Note" | "Not note"; // fix this, I want automatic type coersion 
}

export function addToInbox(user: User, message: InboxMessage): Promise<Deno.KvCommitResult> {
    return kv.set(["users", user.username, "inbox", message.id], message);
}

export async function getNotes(user: User): Promise<InboxNote[]> {
    const ret = [];
    const entries = kv.list<InboxMessage>({ prefix: ["users", user.username, "inbox"]});
    for await (const entry of entries) {
        if (entry.value.type !== "Note") {
            continue;
        }
        const value = entry.value as InboxNote;
        ret.push(value);
    }
    return ret;
}