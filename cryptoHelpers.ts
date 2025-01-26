export function toBase64(arrbuff: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(arrbuff);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    let base64 = btoa(binary);
    base64 = base64.replace(/=/g, "");
    return base64;
}

export function fromBase64(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function importRSAPrivateKey(pem: string): Promise<CryptoKey> {
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

export async function importRSAPublicKey(pem: string): Promise<CryptoKey> {
    // Remove PEM header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemBody = pem.replace(pemHeader, "").replace(pemFooter, "").replace(/\n/g, "").trim();

    // Decode Base64 to ArrayBuffer
    const binaryDer = Uint8Array.from(atob(pemBody), (char) => char.charCodeAt(0));

    // Import the RSA public key
    return await crypto.subtle.importKey(
        "spki", // The key format (SPKI for public keys)
        binaryDer.buffer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" }, // Use the appropriate hash algorithm
        },
        true, // Whether the key is extractable (can be exported)
        ["verify"] // The key's intended uses
    );
}


export async function exportRSAPublicKey(key: CryptoKey): Promise<string> {
    const publicKey = await crypto.subtle.exportKey("spki", key);
    const publicKeyBinary = new Uint8Array(publicKey);
    const publicKeyBase64 = toBase64(publicKeyBinary);
    return `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
}