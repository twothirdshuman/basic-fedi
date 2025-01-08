import { rarelyTypicalRequest } from "./requests.ts";

Deno.serve({
    port: 8005
}, async (req) => {
    const url = new URL(req.url);
    console.log(req.headers.get("X-Forwarded-For"));

    if (url.pathname == "/acttor") {
        return new Response(await Deno.readFile("./docs/actor.json"), {
            headers: {
                "Content-Type": "application/activity+json"
            }
        });
    }
    if (url.pathname == "/.well-known/webfinger") {
        const resource = url.searchParams.get("resource");
        if (resource === "testing@fedi-test.mooo.com") {
            return new Response(await Deno.readFile("./docs/actor-finger.json"));
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