import { CreateActivity, Note } from "./types.ts";
import { ulid } from "jsr:@std/ulid";
import { readCreateActivity, readNote, readObject } from "./jsonToTypes.ts";
import { Ok, Result, Err, undefinedIfErr } from "../helpers.ts";
import { addToInbox, InboxNote } from "../database.ts";
import { USER } from "../config.ts";
type HttpStatusCode = number;
interface IncomingMessage {
    body: string,
    ulid: string,
}

function handleCreation(incoming: IncomingMessage): Result<Promise<Deno.KvCommitResult>, HttpStatusCode> {
    const createActivityUnkown = readCreateActivity(incoming.body, readObject)?.data;
    if (createActivityUnkown === undefined) {
        return Err(400);
    }

    if (createActivityUnkown.object.type !== "Note") {
        return Err(501);
    }
    const createActivity = readCreateActivity(incoming.body, readNote)?.data;
    if (createActivity === undefined) {
        return Err(400);
    }
    const noteDB: InboxNote = {
        type: "Note",
        id: incoming.ulid,
        message: {
            content: createActivity.object.content,
            published: createActivity.object.published.toString(),
            cw: null,
            sensative: createActivity.object.sensative
        }
    };

    const promiseDB = addToInbox({
        username: USER
    }, noteDB);
    return Ok(promiseDB);
}

async function writeMessageToFS(incoming: IncomingMessage) {
    await Deno.writeFile(`dbs/${incoming.ulid}.json`, new TextEncoder().encode(incoming.body));
}

export async function inboxEndpoint(req: Request): Promise<Result<undefined, HttpStatusCode>> {
    const incoming: IncomingMessage = {
        body: await req.text(),
        ulid: ulid(),
    };

    const object = readObject(incoming.body)?.data;
    if (object === undefined) {
        return Err(400);
    }
    if (object.type === "Delete") {
        return Ok(undefined);
    }

    const promises: Promise<unknown>[] = [writeMessageToFS(incoming)];
    if (object.type === "Create") {
        const result = handleCreation(incoming);
        if (result.status === "error") {
            return Err(result.data);
        }
    }
    
   

    return Ok(undefined);
}