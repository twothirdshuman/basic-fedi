import { CreateActivity, Note } from "./types.ts";

export async function inboxEndpoint(req: Request): Promise<{status:"error", data:number} | {status:"success"}> {
    const bodyText = await req.text();
    let realBody;
    try {
        realBody = JSON.parse(bodyText);
    } catch (_err) { return {status:"error",data:400}; }

    if (realBody instanceof Note) {

    }

    return {status:"success"};
}