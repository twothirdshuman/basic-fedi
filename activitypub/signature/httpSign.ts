import { toBase64, fromBase64, importRSAPublicKey } from "./cryptoHelpers.ts";
import * as CONFIG from "../../config.ts";
import { isObject, Ok, Err, Result } from "../../helpers.ts";
import { signRequest } from "./followReq.ts";

type IsValidSignature = Result<boolean, string>;
type ValidRequest = Request;
interface SignatureHeader {
    keyId: string;
    algorithm: string;
    headers: string[];
    signature: string;
}

function ParseSignatureHeader(signatureHeader: string): SignatureHeader | undefined {
    const parts = signatureHeader.split(",");
    let keyId, algorithm, headers, signature;
    for (const part of parts) {
        const [key, value] = part.split("=");
        if (key === "keyId") {
            keyId = value.split("\"")[1];
        } else if (key === "algorithm") {
            algorithm = value.split("\"")[1];
        } else if (key === "headers") {
            headers = value.split("\"")[1].split(" ");
        } else if (key === "signature") {
            signature = value.split("\"")[1];
        }
    }
    if (keyId === undefined || algorithm === undefined || headers === undefined || signature === undefined) {
        return undefined;
    }
    return { keyId, algorithm, headers, signature };    
}

function signatureHeaderFromRequest(request: Request): SignatureHeader | undefined {
    const signature = request.headers.get("Signature");
    if (signature === null) {
        return undefined;
    }
    return ParseSignatureHeader(signature);
}

async function digestIsCorrect(request: Request): Promise<boolean> {
    const digest = request.headers.get("digest");
    if (digest === null) {
        return false;
    }
    const [algorithm, hash] = digest.split("=");
    if (algorithm !== "SHA-256") {
        return false;
    }
    const body = await request.text();
    if (body === null) {
        return false;
    }
    const bodyBuffer = new Uint8Array(new TextEncoder().encode(body));
    const hashBuffer = toBase64(await crypto.subtle.digest("SHA-256", bodyBuffer));
    return hash === hashBuffer;
}

let checkDate = true;
export function setCheckDate(value: boolean) {
    console.warn("⚠️ ⚠️ WARNING: Disabling date checking is insecure and should only be used for testing purposes. ⚠️ ⚠️");
    checkDate = value;
}
async function containsValidHeaders(request: Request): Promise<boolean> {
    // the required headers are (request-target), host, date, and digest
    // if the request is a GET request, the digest header is not required
    // (request-target) can be ignored since it is not sent in the request

    if (signatureHeaderFromRequest(request) === undefined) {
        return false;
    }

    const host = request.headers.get("host");
    if (host === null || host !== CONFIG.HOSTNAME){  
        return false;
    }
    
    const dateString = request.headers.get("date");
    if (dateString === null) {
        return false;
    }
    const currentDate = new Date();
    const date = new Date(dateString);
    
    if (checkDate) {
        if (Math.abs(currentDate.getTime() - date.getTime()) > 30000) {
            return false;
        }
    }

    if (request.method !== "GET") {
        if (!await digestIsCorrect(request)) {
            return false;
        }
    }

    return true;
}

function getSignedString(request: ValidRequest): string | undefined {
    const signatureHeader = signatureHeaderFromRequest(request);
    if (signatureHeader === undefined) {
        return undefined;
    }

    let signedString = "";
    for (const header of signatureHeader.headers) {
        if (header === "(request-target)") {
            signedString += `(request-target): ${request.method.toLowerCase()} ${new URL(request.url).pathname}\n`;
            continue;
        } 
        
        const headerValue = request.headers.get(header);
        if (headerValue === null) {
            return undefined;
        }

        signedString += `${header}: ${headerValue}\n`;
    }

    return signedString.trim();
}

export async function verifySignature(request: Request, cryptoKey: CryptoKey): Promise<boolean> {
    if (!await containsValidHeaders(request)) {
        return false;
    }

    const signedString = getSignedString(request);
    if (signedString === undefined) {
        return false;
    }
    const signatureHeader = signatureHeaderFromRequest(request);
    if (signatureHeader === undefined) {
        return false;
    }
    if (signatureHeader.algorithm !== "rsa-sha256") {
        return false;
    }
    const signature = fromBase64(signatureHeader.signature);
    
    return await crypto.subtle.verify(
        {
            name: "RSASSA-PKCS1-v1_5",
        },
        cryptoKey,
        signature,
        new TextEncoder().encode(signedString)
    );
}

async function getKey(keyId: string): Promise<Result<CryptoKey, string>> {

    const req = new Request(new URL(keyId), { 
        headers: {
            "Accept": "application/activity+json"
        }
    });
    const response = await fetch(await signRequest(req)).catch(_ => undefined);
    if (response === undefined) {
        return Err(`could not fetch ${keyId}`);
    }
    if (!response.ok) {
        return Err(`fetch returned err: ${response.status} body: ${await response.text()}`);
    }
    const responseJson: unknown = await response.json().catch(_ => undefined);
    
    if (!isObject(responseJson)) {
        return Err(`fetch did not return json object`);
    }

    if (!isObject(responseJson.publicKey)) {
        return Err(`json object doesn't contain publicKey`);
    }
    const keyPem = responseJson.publicKey.publicKeyPem;
    if (typeof keyPem !== "string") {
        return Err(`json object doesn't contain publicKey.publicKeyPem`);
    } 
    return Ok(await importRSAPublicKey(keyPem));
}

export async function verifyRequest(request: Request): Promise<IsValidSignature> {
    if (!await containsValidHeaders(request.clone())) {
        return Err("contains invalid headers");
    }
    const signatureHeader = signatureHeaderFromRequest(request);
    if (signatureHeader === undefined) {
        return Err("cannot find signature header");
    }

    const key = await getKey(signatureHeader.keyId)
    if (key.status === "error") {
        return Err(`Unable to get key. KeyError: ${key.data}`);
    }

    return Ok(await verifySignature(request, key.data));
}