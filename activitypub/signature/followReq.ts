import { USER, HOSTNAME } from "../../config.ts";
import { importRSAPrivateKey, toBase64 } from "./cryptoHelpers.ts";

export async function follow(recipientUrl: URL, recipientInbox: URL): Promise<undefined> {

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

    const reqBody = followRequestMessage;

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

export async function signRequest(request: Request): Promise<Request> {
    const privateKey = await importRSAPrivateKey(new TextDecoder("utf-8").decode(await Deno.readFile("private/user/private.pem")));

    const currentDate = new Date().toUTCString();

    const reqUrl = new URL(request.url);
    const signatureText = new TextEncoder().encode( 
        `(request-target): ${request.method.toLowerCase()} ${reqUrl.pathname}\nhost: ${reqUrl.hostname}\ndate: ${currentDate}`
    );

    const signature = toBase64(await crypto.subtle.sign({
            name: "RSASSA-PKCS1-v1_5",
        },
        await privateKey,
        signatureText
    ));

    const signatureHeader = `keyId="https://${HOSTNAME}/users/${USER}#main-key",algorithm="rsa-sha256",headers="(request-target) host date",signature="${signature}"`;

    request.headers.set("Date", currentDate);
    request.headers.set("Signature", signatureHeader);

    return request;
}