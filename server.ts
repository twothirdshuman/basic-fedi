import * as CONFIG from "./config.ts";
import { Router } from "./router.ts";
import { ulid } from "jsr:@std/ulid";
import { parseArgs } from "jsr:@std/cli/parse-args";

const router = new Router();

router.get("/", (_) => {
    return new Response("this is /");
})

router.post("/users/*/inbox", async (req) => {
    return new Response(null, {status:501});
})

router.get(`/users/${CONFIG.USER}`, async (_) => {
    const publicKey = await Deno.readFile("private/user/public.pem")
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
    const response = router.serve(req);
    if (response !== undefined) {
        return response;
    }

    return new Response("Not found", { status:404 });
});