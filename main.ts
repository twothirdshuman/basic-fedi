function toBase64(arrbuff: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(arrbuff);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa( binary );
}

async function importRSAPrivateKey(pem: string): Promise<CryptoKey> {
    // Remove PEM header and footer
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemBody = pem.replace(pemHeader, "").replace(pemFooter, "").replace(/\n/g, "").trim();

    // Decode Base64 to ArrayBuffer
    const binaryDer = Uint8Array.from(atob(pemBody), (char) => char.charCodeAt(0));

    // Import the RSA private key
    return await crypto.subtle.importKey(
        "pkcs8", // The key format (PKCS #8 for private keys)
        binaryDer.buffer,
        {
            name: "RSA-PSS",
            hash: { name: "SHA-256" }, // Use the appropriate hash algorithm
        },
        true, // Whether the key is extractable (can be exported)
        ["sign"] // The key's intended uses
    );
} 

function getRequestTarget(req: Request): string {
    const url = new URL(req.url);
    const method = req.method;
    const methodLowercase = method.toLowerCase();

    return `${methodLowercase} ${url.pathname}`;
}

function getHost(req: Request): string {
    const url = new URL(req.url);
    return url.host;
}

const privateKey = await importRSAPrivateKey(new TextDecoder("utf-8").decode(await Deno.readFile("./private/user/private.pem")));
async function signRequest(req: Request): Promise<Request> {
    const buffer = await req.arrayBuffer();
    const body = new Uint8Array(buffer);
    const digest = "SHA-256=" + toBase64(await crypto.subtle.digest("SHA-256", body));
    const httpDate = new Date().toUTCString();
    const signedString = `(request-target): ${getRequestTarget(req)}\nhost: ${getHost(req)}\ndate: ${httpDate}\ndigest: ${digest}`;
    const signedStringData = new TextEncoder().encode(signedString);

    const signature = toBase64(await crypto.subtle.sign({
            name: "RSA-PSS",
            saltLength: 32,
        },
        privateKey,
        signedStringData
    ));

    const signatureHeader = `keyId="https://fedi-test.com/actor",headers="(request-target) host date digest",signature=${signature}`;

    const reqReturn = new Request(req, {
        headers: {
            "Host": getHost(req),
            "Date": httpDate,
            "Signature": signatureHeader,
            "Digest": digest
        },
        body: null
    });

    return reqReturn;
}
/*
setTimeout(async () => {
    const res = await fetch("https://wetdry.world/.well-known/webfinger?resource=acct:rarely_typical@wetdry.world")
    console.log(res.status);
    const json = await res.json();
    
    console.log(json);
    
    const res2 = await fetch("https://wetdry.world/users/rarely_typical", {
        headers: {
            "Accept":"application/activity+json"
        }
    });

    // We are getting denied since we don't sign the request
    // console.log(res2.status, res2.headers, await res2.json());
}, 0);
*/

async function rarelyTypicalRequest() {
    const res2 = await fetch(await signRequest(new Request("https://wetdry.world/users/rarely_typical", {
        headers: {
            "Accept":"application/activity+json"
        }
    })));

    console.log(res2.status, res2.headers, await res2.json());
}

console.log(await signRequest(new Request("https://wetdry.world/users/rarely_typical", {
    headers: {
        "Accept":"application/activity+json"
    }
})));

Deno.serve({
    port: 8005
}, async (req) => {
    const url = new URL(req.url);

    if (url.pathname == "/actor") {
        return new Response(await Deno.readFile("./docs/actor.json"));
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