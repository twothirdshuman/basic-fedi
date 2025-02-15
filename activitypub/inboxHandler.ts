import { ulid } from "jsr:@std/ulid";
import { readCreateActivity, readNote, readObject } from "./jsonToTypes.ts";
import { Ok, Result, Err } from "../helpers.ts";
import { addToInbox, InboxNote } from "../database.ts";
import { USER } from "../config.ts";
import { verifyRequest } from "./signature/httpSign.ts";
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
            sensative: createActivity.object.sensitive
        }
    };

    const promiseDB = addToInbox({
        username: USER
    }, noteDB);
    return Ok(promiseDB);
}

async function writeMessageToFS(incoming: IncomingMessage, request: Request) {
    const headers = Array.from(request.headers.entries());
    const result = verifyRequest(request.clone());

    await Deno.writeFile(`dbs/${incoming.ulid}.json`, new TextEncoder().encode(JSON.stringify({
        verificationSuccess: await result,
        headers: headers,
        body: (() => {try { return JSON.parse(incoming.body); } catch (_) { return incoming.body; }})()
    })));
}

export async function inboxEndpoint(req: Request): Promise<Result<undefined, HttpStatusCode>> {
    const incoming: IncomingMessage = {
        body: await req.clone().text(),
        ulid: ulid(),
    };
    const object = readObject(incoming.body)?.data;
    if (object === undefined) {
        return Err(400);
    }
    if (object.type === "Delete") {
        console.log(`Throwing away delete request. verificationSuccess: ${verifyRequest(req.clone())}`)
        return Ok(undefined);
    }

    const writePromise = writeMessageToFS(incoming, req.clone());
    if (object.type === "Create") {
        const result = handleCreation(incoming);
        if (result.status === "error") {
            await writePromise;
            return Err(result.data);
        }
        if (!await result.data.then(() => true).catch(() => false)) {
            await writePromise;
            return Err(500);
        }
    }
    
    await writePromise;
    return Ok(undefined);
}