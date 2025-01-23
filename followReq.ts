import { USER, HOSTNAME } from "./config.ts";

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
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" }, // Use the appropriate hash algorithm
        },
        true, // Whether the key is extractable (can be exported)
        ["sign"] // The key's intended uses
    );
} 

export async function Follow(recipientUrl: URL, recipientInbox: URL): Promise<undefined> {

    const senderUrl = `https://${HOSTNAME}/users/${USER}`;
    const senderKey = `https://${HOSTNAME}/users/${USER}#main-key`;

    const activityId = `https://${HOSTNAME}/users/${USER}/follows/test`;
    const privateKey = importRSAPrivateKey(new TextDecoder("utf-8").decode(await Deno.readFile("private/user/private.pem")));

    const followRequestMessage = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": activityId,
        "type": "Follow",
        "actor": senderUrl,
        "object": recipientUrl
    };

    const unfollowRequestMessage = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": `${activityId}/undo`,
        "type": "Undo",
        "actor": senderUrl,
        "object": followRequestMessage,
    };

    const reqBody = unfollowRequestMessage;

    const digest = toBase64(
        await crypto.subtle.digest("SHA-256", 
            new TextEncoder().encode(JSON.stringify(reqBody))
        )
    );

    const currentDate = new Date().toUTCString();
    // const currentDate = "Mon, 20 Jan 2025 09:12:32 GMT";

    const signatureText = new TextEncoder().encode( 
        `(request-target): post ${recipientInbox.pathname}\nhost: ${recipientUrl.hostname}\ndate: ${currentDate}\ndigest: SHA-256=${digest}`
    );

    const signature = toBase64(await crypto.subtle.sign({
            name: "RSASSA-PKCS1-v1_5",
        },
        await privateKey,
        signatureText
    ));

    const signatureHeader = `keyId="${senderKey}",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature}"`;
    const headers = {
        'Date': currentDate,
        'Content-Type': 'application/activity+json',
        'Host': recipientUrl.host,
        'Digest': "SHA-256="+digest,
        'Signature': signatureHeader
    };
    
    // printRequest(recipientInbox.toString(), headers, JSON.stringify(followRequestMessage));

    
    const r = await fetch(recipientInbox, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(reqBody)
    });
    
    console.log(r);
    console.log((await r.text()));
    
}   

function printRequest(url: string, headers: object, body: string) {
    console.log(`POST ${url}`);
    for (const [key, value] of Object.entries(headers)) {
        console.log(`${key}: ${value}`);
    }
    console.log();
    console.log(body);
}