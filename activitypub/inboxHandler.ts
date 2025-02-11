import { CreateActivity, Note } from "./types.ts";
import { readCreateActivity, readObject } from "./jsonToTypes.ts";
import { Ok, Result, Err, undefinedIfErr } from "../helpers.ts";
type HttpStatusCode = number;

function handleCreation(body: string): Result<undefined, HttpStatusCode> {
    const createActivity = readCreateActivity(body, readObject)?.data;
    if (createActivity === undefined) {
        return Err(400);
    }

    if (createActivity.object.type !== "Note") {
        return Err(501);
    }

    

    return Ok(undefined);
}

export async function inboxEndpoint(req: Request): Promise<Result<undefined, HttpStatusCode>> {
    const body = await req.text()
    const object = readObject(body)?.data;
    if (object === undefined) {
        return Err(400);
    }
    if (object.type === "Delete") {
        return Ok(undefined);
    }
    if (object.type === "Accept") {
        return Ok(undefined);
    }
    if (object.type === "Collection") {
        return Err(501);
    }
    if (object.type === "Note") {
        // only create Objects are sent
        return Err(501);
    }
    if (object.type === "Create") {
        handleCreation(body);
    }

    return Ok(undefined);
}