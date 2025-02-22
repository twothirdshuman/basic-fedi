import { inboxEndpoint } from "./activitypub/inboxHandler.ts";
import { setCheckDate } from "./activitypub/signature/httpSign.ts";
import * as CONFIG from "./config.ts";
import { addToInbox, getNotes } from "./database.ts";
import { Router } from "./router.ts";

import { parseArgs } from "jsr:@std/cli/parse-args";
import { serveFile, serveDir } from "jsr:@std/http";

setTimeout(async () => {
    const res = await fetch("http://192.168.1.123:8006/01JMJ7290N09AB1TXV4CA83HSP.json");
    const body = await res.json();
    setCheckDate(false);

    const ress = await fetch(`http://127.0.0.1:8000/users/${CONFIG.USER}/inbox`, {
        method: "POST",
        body: JSON.stringify(body.body),
        headers: body.headers   
    });
    console.log(ress.ok);
}, 100);

const router = new Router();

router.get("/", (req) => {
    return serveFile(req, "./static/index.html");
});

router.get("/static/*", (req) => {
    return serveDir(req, {
        fsRoot: "./static",
        urlRoot: "static"
    });
})

router.get("/api/kulupium/v0/getPosts", async (_) => {

    const notes = await getNotes({username:CONFIG.USER});
    

    return new Response(JSON.stringify(notes), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
});

router.post("/users/*/inbox", async (req) => {
    const result = await inboxEndpoint(req);
    if (result.status === "ok") {
        return new Response(null, {status:201});
    }
    return new Response(null, {status:result.data});
});

router.get(`/users/${CONFIG.USER}`, async (_) => {
    const publicKey = await Deno.readFile("dbs/private/user/public.pem")
        .then(byteArr => new TextDecoder("utf-8").decode(byteArr));

    return new Response(JSON.stringify({
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
        ],
        "id": `https://${CONFIG.HOSTNAME}/users/${CONFIG.USER}`,
        "inbox": `https://${CONFIG.HOSTNAME}/users/${CONFIG.USER}/inbox`,
        "outbox": `https://${CONFIG.HOSTNAME}/users/${CONFIG.USER}/outbox`,
        "type": "Person",
        "name": CONFIG.USER,
        "preferredUsername": CONFIG.USER,
        "publicKey": {
            "id": `https://${CONFIG.HOSTNAME}/users/${CONFIG.USER}#main-key`,
            "owner": `https://${CONFIG.HOSTNAME}/users/${CONFIG.USER}`,
            "publicKeyPem": publicKey
        }
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/activity+json"
        }
    });
});

router.get("/.well-known/webfinger", (req) => {
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource");

    if (resource !== `acct:${CONFIG.USER}@${CONFIG.HOSTNAME}`) {
        return new Response('{"error":"User not found"}', {status:404,headers:{"Content-Type":"application/json"}});
    }

    return new Response(JSON.stringify({
        "subject": `acct:${CONFIG.USER}@${CONFIG.HOSTNAME}`,
        "links": [
            {
                "rel": "self",
                "type": "application/activity+json",
                "href": `https://${CONFIG.HOSTNAME}/users/${CONFIG.USER}`
            }
        ]
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/jrd+json"
        }
    });
});

const flags = parseArgs(Deno.args, {
    string: ["port"],
    default: {
        port: "8000"
    }
});

Deno.serve({
    port: Number(flags.port)
}, (req) => {
    console.log(`request for ${req.url} method ${req.method} signatureHeader: ${req.headers.get("Signature")}`);
    const response = router.serve(req);
    if (response !== undefined) {
        return response;
    }

    return new Response("Not found", { status:404 });
});