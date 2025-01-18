import Fastify from "npm:fastify";
import { rarelyTypicalRequest } from "./requests.ts";

const inbox: unknown[] = [];

const fastify = Fastify({
    logger: true
});

fastify.get("/", (_request, reply) => {
    reply.send(inbox);
});

fastify.get("/users/:username", (req, reply) => {
    const username = (req.params as {username:string}).username;
    if (username !== "rarely-typical") {
        reply.status(404).send({error: "User not found"});
        return;
    }

    const publicKey = Deno.readFile("private/user/public.pem")
        .then(byteArr => new TextDecoder("utf-8").decode(byteArr));

    reply.header("content-type", "application/activity+json")
    reply.send({
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
        ],
        "id": "https://example.com/users/rarely-typical",
        "inbox": "https://example.com/users/rarely-typical/inbox",
        "outbox": "https://example.com/users/rarely-typical/outbox",
        "type": "Person",
        "name": "rarely-typical",
        "preferredUsername": "rarely-typical",
        "publicKey": {
            "id": "https://example.com/users/rarely-typical#main-key",
            /*"id": "https://example.com/users/zampano",*/
            "publicKeyPem": publicKey
        }
    });
});

fastify.get("/.well-known/webfinger", (req, reply) => {
    const url = new URL(`https://127.0.0.1${String(req.url)}`);
    const resource = url.searchParams.get("resource");

    if (resource !== "acct:rarely-typical@fedi-test.mooo.com") {
        reply.status(404).send({error:"User not found"});
        return;
    }

    reply.header("content-type", "application/jrd+json")
    reply.send({
        "subject": "acct:rarely-typical@example.com",
        "links": [
            {
                "rel": "self",
                "type": "application/activity+json",
                "href": "https://example.com/users/rarely-typical"
            }
        ]
    });
});

fastify.post("/users/:username/inbox", (req, reply) => {
    reply.status(202).send();

    console.log(req.headers);
    inbox.push(req.body);
})

await fastify.listen({
    port: 3000,
    host: "0.0.0.0"
});
/*
Deno.serve({
    port: 8005
}, async (req) => {
    const url = new URL(req.url);
    console.log(req.headers.get("X-Forwarded-For"));

    if (url.pathname == "/actor") {
        return new Response(await Deno.readFile("./docs/actor.json"), {
            headers: {
                "Content-Type": "application/activity+json"
            }
        });
    }
    if (url.pathname == "/.well-known/webfinger") {
        const resource = url.searchParams.get("resource");
        if (resource === "testing@fedi-test.mooo.com") {
            return new Response(await Deno.readFile("./docs/actor-finger.json"), {
                headers: {
                    "Content-Type": "application/jrd+json"
                }
            });
        }
    }
    if (url.pathname === "/") {
        return new Response("This is the / document");
    }
    if (url.pathname === "/ask") {
        await rarelyTypicalRequest();
        return new Response("asked for rarely_typical info");
    }

    return new Response(null, {status:404});
});
*/