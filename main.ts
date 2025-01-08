/*
const res = await fetch("https://wetdry.world/.well-known/webfinger?resource=acct:rarely_typical@wetdry.world")
console.log(res.status);
const json = await res.json();

console.log(json);


const res2 = await fetch("https://wetdry.world/users/rarely_typical", {
    headers: {
        "Accept": "application/activity+json"
    }
});
// We are getting denied since we don't sign the request
console.log(res2.status, res2.headers);
Deno.exit(0);
*/

Deno.serve(async (req) => {
    const url = new URL(req.url);

    if (url.pathname == "/actor") {
        return new Response(await Deno.readFile("./docs/actor.json"));
    }


    return new Response(null, {status:404});
});