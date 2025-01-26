import { assert } from "jsr:@std/assert";
import { verifySignature, setCheckDate } from "./httpSign.ts"; 
import { importRSAPublicKey } from "./cryptoHelpers.ts";

Deno.test("can check rarely typical", async () => {
    setCheckDate(false);

    const rarelyTypicalUserJson = {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
            {
                "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
                "toot": "http://joinmastodon.org/ns#",
                "featured": { "@id": "toot:featured", "@type": "@id" },
                "featuredTags": { "@id": "toot:featuredTags", "@type": "@id" },
                "alsoKnownAs": { "@id": "as:alsoKnownAs", "@type": "@id" },
                "movedTo": { "@id": "as:movedTo", "@type": "@id" },
                "schema": "http://schema.org#",
                "PropertyValue": "schema:PropertyValue",
                "value": "schema:value",
                "discoverable": "toot:discoverable",
                "suspended": "toot:suspended",
                "memorial": "toot:memorial",
                "indexable": "toot:indexable",
                "attributionDomains": { "@id": "toot:attributionDomains", "@type": "@id" },
                "focalPoint": { "@container": "@list", "@id": "toot:focalPoint" }
            }
        ],
        "id": "https://tech.lgbt/users/rarely_typical",
        "type": "Person",
        "following": "https://tech.lgbt/users/rarely_typical/following",
        "followers": "https://tech.lgbt/users/rarely_typical/followers",
        "inbox": "https://tech.lgbt/users/rarely_typical/inbox",
        "outbox": "https://tech.lgbt/users/rarely_typical/outbox",
        "featured": "https://tech.lgbt/users/rarely_typical/collections/featured",
        "featuredTags": "https://tech.lgbt/users/rarely_typical/collections/tags",
        "preferredUsername": "rarely_typical",
        "name": "rarely typical",
        "summary": "<p>I'm just a random internet citizen</p><p>I really should post more often </p><p>I'm probably bi, ace, or both; or some other flavor of queer </p><p>this is my favorite bear --&gt; ʕ•ᴥ•ʔ (don't hurt him)</p>",
        "url": "https://tech.lgbt/@rarely_typical",
        "manuallyApprovesFollowers": true,
        "discoverable": true,
        "indexable": true,
        "published": "2023-09-12T00:00:00Z",
        "memorial": false,
        "publicKey": {
            "id": "https://tech.lgbt/users/rarely_typical#main-key",
            "owner": "https://tech.lgbt/users/rarely_typical",
            "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvAgaU8+t68XMFJ5hq/eZ\nXnliKN7hVnDFVc2Vb2yyc3raE/LlyLo7nqfi1G7XaE9F3/hGIpW7MRzezaMpnB/i\nJZ4Gqxys0z8XoQAMA1inYd7MR2ltDpOMTpSTHmI6kdCthemR2LMgFZO74BZZyEmp\nn+l6dZSpmHV2QSw7DU9dGYuk9u0PsgfT05UqmL+6gZERUeDQDmTc8Bec2PCv5iOE\nDNlnWFjySjdtxmLb4KN8kogK8H6R41/UudJvm03KE2UbhGLgIz6FX+Ytqiq0LFG5\nLEhHdaRC5dh1Z5/3H+4lbkRvYIN7+MNKXH18XugXP9ucoZ5w++gEkhtaL+e6gJAL\nQQIDAQAB\n-----END PUBLIC KEY-----\n"
        },
        "tag": [],
        "attachment": [
            {
                "type": "PropertyValue",
                "name": "my website (not good)",
                "value": "<a href=\"https://rarely-typical.neocities.org/\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">rarely-typical.neocities.org/</span><span class=\"invisible\"></span></a>"
            }
        ],
        "endpoints": {
            "sharedInbox": "https://tech.lgbt/inbox"
        },
        "icon": {
            "type": "Image",
            "mediaType": "image/png",
            "url": "https://media.tech.lgbt/accounts/avatars/111/053/483/188/740/661/original/83e3270ca3cac38d.png"
        }
    };
    const requestJson = {"headers":[["accept-encoding","gzip"],["connection","close"],["content-length","390"],["content-type","application/activity+json"],["date","Sat, 25 Jan 2025 23:43:24 GMT"],["digest","SHA-256=iqsAUJ7rExPw6FFf3FreBe64PZklcVo5AWTxK0F35xM="],["host","fedi-test.mooo.com"],["signature","keyId=\"https://tech.lgbt/users/rarely_typical#main-key\",algorithm=\"rsa-sha256\",headers=\"(request-target) host date digest content-type\",signature=\"SaP117ZFNobKipd0D/Q9jq9Uug+RMcl/lVQg3Qr5AGGF/YQbCLQnRs3Py8qHzVOnASFm6U0l5zNlOUpVhEC/1QEJyeBul597TBu5YWDswivQVYRjKKMHPniJbslBZRgMYbAkGBnhbvnZM0fgNEZyxbJAgyI/qwaPPFDJ6gs7cUe8v5B9F4k2RDpPnrMc1G6FRpf5rg9F3hxxB+cXeTUkzf4m7uQ2CXpy1Ocn8ZC+5K50AR7WpwICs5gHBQFcY0AHFr0toim1rLcYNqua63a81r/239jbWb+a2CVKIxFjiAog/SVCT9mdzmKN/dqh06CgP8R3bkzIstYyi09qogZrwA==\""],["user-agent","Mastodon/4.4.0-alpha.1+glitch (http.rb/5.2.0; +https://tech.lgbt/)"],["x-forwarded-for","147.182.172.47"],["x-forwarded-proto","https"],["x-real-ip","147.182.172.47"]],"body":{"@context":"https://www.w3.org/ns/activitystreams","id":"https://tech.lgbt/users/rarely_typical#accepts/follows/1670066","type":"Accept","actor":"https://tech.lgbt/users/rarely_typical","object":{"id":"https://fedi-test.mooo.com/users/rarely-typical/follows/test","type":"Follow","actor":"https://fedi-test.mooo.com/users/rarely-typical","object":"https://tech.lgbt/users/rarely_typical"}}};

    const key = await importRSAPublicKey(rarelyTypicalUserJson.publicKey.publicKeyPem);
    const result = await verifySignature(new Request("https://fedi-test.mooo.com/users/rarely-typical/inbox", {
        method: "POST", 
        headers: new Headers(requestJson.headers as [string, string][]), 
        body: JSON.stringify(requestJson.body)
    }), key);
    assert(result);
});

Deno.test("can check invalid rarely typical (changed key)", async () => {
    setCheckDate(false);

    const rarelyTypicalUserJson = {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
            {
                "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
                "toot": "http://joinmastodon.org/ns#",
                "featured": { "@id": "toot:featured", "@type": "@id" },
                "featuredTags": { "@id": "toot:featuredTags", "@type": "@id" },
                "alsoKnownAs": { "@id": "as:alsoKnownAs", "@type": "@id" },
                "movedTo": { "@id": "as:movedTo", "@type": "@id" },
                "schema": "http://schema.org#",
                "PropertyValue": "schema:PropertyValue",
                "value": "schema:value",
                "discoverable": "toot:discoverable",
                "suspended": "toot:suspended",
                "memorial": "toot:memorial",
                "indexable": "toot:indexable",
                "attributionDomains": { "@id": "toot:attributionDomains", "@type": "@id" },
                "focalPoint": { "@container": "@list", "@id": "toot:focalPoint" }
            }
        ],
        "id": "https://tech.lgbt/users/rarely_typical",
        "type": "Person",
        "following": "https://tech.lgbt/users/rarely_typical/following",
        "followers": "https://tech.lgbt/users/rarely_typical/followers",
        "inbox": "https://tech.lgbt/users/rarely_typical/inbox",
        "outbox": "https://tech.lgbt/users/rarely_typical/outbox",
        "featured": "https://tech.lgbt/users/rarely_typical/collections/featured",
        "featuredTags": "https://tech.lgbt/users/rarely_typical/collections/tags",
        "preferredUsername": "rarely_typical",
        "name": "rarely typical",
        "summary": "<p>I'm just a random internet citizen</p><p>I really should post more often </p><p>I'm probably bi, ace, or both; or some other flavor of queer </p><p>this is my favorite bear --&gt; ʕ•ᴥ•ʔ (don't hurt him)</p>",
        "url": "https://tech.lgbt/@rarely_typical",
        "manuallyApprovesFollowers": true,
        "discoverable": true,
        "indexable": true,
        "published": "2023-09-12T00:00:00Z",
        "memorial": false,
        "publicKey": {
            "id": "https://tech.lgbt/users/rarely_typical#main-key",
            "owner": "https://tech.lgbt/users/rarely_typical",
            "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvAgaU8+t68XMFJ5hq/eZ\nXnliKN7hVnDFVc2Vb2yyc3raE/LlyLo7nqfi1G7XaE9F3/hGIpW7MRzezaMpnB/i\nJZ4Gqxys0z8XoQAMA1inYd7MR2ltDpOMTpSTHmI6kdCthemR2LMgFZO74BZZyEmp\nn+l7dZSpmHV2QSw7DU9dGYuk9u0PsgfT05UqmL+6gZERUeDQDmTc8Bec2PCv5iOE\nDNlnWFjySjdtxmLb4KN8kogK8H6R41/UudJvm03KE2UbhGLgIz6FX+Ytqiq0LFG5\nLEhHdaRC5dh1Z5/3H+4lbkRvYIN7+MNKXH18XugXP9ucoZ5w++gEkhtaL+e6gJAL\nQQIDAQAB\n-----END PUBLIC KEY-----\n"
        },
        "tag": [],
        "attachment": [
            {
                "type": "PropertyValue",
                "name": "my website (not good)",
                "value": "<a href=\"https://rarely-typical.neocities.org/\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">rarely-typical.neocities.org/</span><span class=\"invisible\"></span></a>"
            }
        ],
        "endpoints": {
            "sharedInbox": "https://tech.lgbt/inbox"
        },
        "icon": {
            "type": "Image",
            "mediaType": "image/png",
            "url": "https://media.tech.lgbt/accounts/avatars/111/053/483/188/740/661/original/83e3270ca3cac38d.png"
        }
    };
    const requestJson = {"headers":[["accept-encoding","gzip"],["connection","close"],["content-length","390"],["content-type","application/activity+json"],["date","Sat, 25 Jan 2025 23:43:24 GMT"],["digest","SHA-256=iqsAUJ7rExPw6FFf3FreBe64PZklcVo5AWTxK0F35xM="],["host","fedi-test.mooo.com"],["signature","keyId=\"https://tech.lgbt/users/rarely_typical#main-key\",algorithm=\"rsa-sha256\",headers=\"(request-target) host date digest content-type\",signature=\"SaP117ZFNobKipd0D/Q9jq9Uug+RMcl/lVQg3Qr5AGGF/YQbCLQnRs3Py8qHzVOnASFm6U0l5zNlOUpVhEC/1QEJyeBul597TBu5YWDswivQVYRjKKMHPniJbslBZRgMYbAkGBnhbvnZM0fgNEZyxbJAgyI/qwaPPFDJ6gs7cUe8v5B9F4k2RDpPnrMc1G6FRpf5rg9F3hxxB+cXeTUkzf4m7uQ2CXpy1Ocn8ZC+5K50AR7WpwICs5gHBQFcY0AHFr0toim1rLcYNqua63a81r/239jbWb+a2CVKIxFjiAog/SVCT9mdzmKN/dqh06CgP8R3bkzIstYyi09qogZrwA==\""],["user-agent","Mastodon/4.4.0-alpha.1+glitch (http.rb/5.2.0; +https://tech.lgbt/)"],["x-forwarded-for","147.182.172.47"],["x-forwarded-proto","https"],["x-real-ip","147.182.172.47"]],"body":{"@context":"https://www.w3.org/ns/activitystreams","id":"https://tech.lgbt/users/rarely_typical#accepts/follows/1670066","type":"Accept","actor":"https://tech.lgbt/users/rarely_typical","object":{"id":"https://fedi-test.mooo.com/users/rarely-typical/follows/test","type":"Follow","actor":"https://fedi-test.mooo.com/users/rarely-typical","object":"https://tech.lgbt/users/rarely_typical"}}};

    const key = await importRSAPublicKey(rarelyTypicalUserJson.publicKey.publicKeyPem);
    const result = await verifySignature(new Request("https://fedi-test.mooo.com/users/rarely-typical/inbox", {
        method: "POST", 
        headers: new Headers(requestJson.headers as [string, string][]), 
        body: JSON.stringify(requestJson.body)
    }), key);
    assert(!result);
});

Deno.test("can check rarely typical (changed body)", async () => {
    setCheckDate(false);

    const rarelyTypicalUserJson = {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
            {
                "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
                "toot": "http://joinmastodon.org/ns#",
                "featured": { "@id": "toot:featured", "@type": "@id" },
                "featuredTags": { "@id": "toot:featuredTags", "@type": "@id" },
                "alsoKnownAs": { "@id": "as:alsoKnownAs", "@type": "@id" },
                "movedTo": { "@id": "as:movedTo", "@type": "@id" },
                "schema": "http://schema.org#",
                "PropertyValue": "schema:PropertyValue",
                "value": "schema:value",
                "discoverable": "toot:discoverable",
                "suspended": "toot:suspended",
                "memorial": "toot:memorial",
                "indexable": "toot:indexable",
                "attributionDomains": { "@id": "toot:attributionDomains", "@type": "@id" },
                "focalPoint": { "@container": "@list", "@id": "toot:focalPoint" }
            }
        ],
        "id": "https://tech.lgbt/users/rarely_typical",
        "type": "Person",
        "following": "https://tech.lgbt/users/rarely_typical/following",
        "followers": "https://tech.lgbt/users/rarely_typical/followers",
        "inbox": "https://tech.lgbt/users/rarely_typical/inbox",
        "outbox": "https://tech.lgbt/users/rarely_typical/outbox",
        "featured": "https://tech.lgbt/users/rarely_typical/collections/featured",
        "featuredTags": "https://tech.lgbt/users/rarely_typical/collections/tags",
        "preferredUsername": "rarely_typical",
        "name": "rarely typical",
        "summary": "<p>I'm just a random internet citizen</p><p>I really should post more often </p><p>I'm probably bi, ace, or both; or some other flavor of queer </p><p>this is my favorite bear --&gt; ʕ•ᴥ•ʔ (don't hurt him)</p>",
        "url": "https://tech.lgbt/@rarely_typical",
        "manuallyApprovesFollowers": true,
        "discoverable": true,
        "indexable": true,
        "published": "2023-09-12T00:00:00Z",
        "memorial": false,
        "publicKey": {
            "id": "https://tech.lgbt/users/rarely_typical#main-key",
            "owner": "https://tech.lgbt/users/rarely_typical",
            "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvAgaU8+t68XMFJ5hq/eZ\nXnliKN7hVnDFVc2Vb2yyc3raE/LlyLo7nqfi1G7XaE9F3/hGIpW7MRzezaMpnB/i\nJZ4Gqxys0z8XoQAMA1inYd7MR2ltDpOMTpSTHmI6kdCthemR2LMgFZO74BZZyEmp\nn+l6dZSpmHV2QSw7DU9dGYuk9u0PsgfT05UqmL+6gZERUeDQDmTc8Bec2PCv5iOE\nDNlnWFjySjdtxmLb4KN8kogK8H6R41/UudJvm03KE2UbhGLgIz6FX+Ytqiq0LFG5\nLEhHdaRC5dh1Z5/3H+4lbkRvYIN7+MNKXH18XugXP9ucoZ5w++gEkhtaL+e6gJAL\nQQIDAQAB\n-----END PUBLIC KEY-----\n"
        },
        "tag": [],
        "attachment": [
            {
                "type": "PropertyValue",
                "name": "my website (not good)",
                "value": "<a href=\"https://rarely-typical.neocities.org/\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">rarely-typical.neocities.org/</span><span class=\"invisible\"></span></a>"
            }
        ],
        "endpoints": {
            "sharedInbox": "https://tech.lgbt/inbox"
        },
        "icon": {
            "type": "Image",
            "mediaType": "image/png",
            "url": "https://media.tech.lgbt/accounts/avatars/111/053/483/188/740/661/original/83e3270ca3cac38d.png"
        }
    };
    const requestJson = {
        "headers": [
            ["accept-encoding", "gzip"],
            ["connection", "close"],
            ["content-length", "390"],
            ["content-type", "application/activity+json"],
            ["date", "Sat, 25 Jan 2025 23:43:24 GMT"],
            ["digest", "SHA-256=iqsAUJ7rExPw6FFf3FreBe64PZklcVo5AWTxK0F35xM="],
            ["host", "fedi-test.mooo.com"],
            ["signature", "keyId=\"https://tech.lgbt/users/rarely_typical#main-key\",algorithm=\"rsa-sha256\",headers=\"(request-target) host date digest content-type\",signature=\"SaP117ZFNobKipd0D/Q9jq9Uug+RMcl/lVQg3Qr5AGGF/YQbCLQnRs3Py8qHzVOnASFm6U0l5zNlOUpVhEC/1QEJyeBul597TBu5YWDswivQVYRjKKMHPniJbslBZRgMYbAkGBnhbvnZM0fgNEZyxbJAgyI/qwaPPFDJ6gs7cUe8v5B9F4k2RDpPnrMc1G6FRpf5rg9F3hxxB+cXeTUkzf4m7uQ2CXpy1Ocn8ZC+5K50AR7WpwICs5gHBQFcY0AHFr0toim1rLcYNqua63a81r/239jbWb+a2CVKIxFjiAog/SVCT9mdzmKN/dqh06CgP8R3bkzIstYyi09qogZrwA==\""],
            ["user-agent", "Mastodon/4.4.0-alpha.1+glitch (http.rb/5.2.0; +https://tech.lgbt/)"],
            ["x-forwarded-for", "147.182.172.47"],
            ["x-forwarded-proto", "https"],
            ["x-real-ip", "147.182.172.47"]
        ],
        "body": {
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "https://tech.lgbt/users/rarely_typical#accepts/follows/1670066",
            "type": "Accept",
            "actor": "https://tech.lgbt/users/rarely_typical",
            "object": {
                "id": "https://fedi-test.mooo.com/users/rarely-typical/follows/test",
                "type": "Follow",
                "actor": "https://fedi-test.mooo.com/users/rarely-typical",
                "object": "https://tech.lgbt/users/rarely_typical",
                "Dummy data": "This is not part of the original request"
            }
        }
    };

    const key = await importRSAPublicKey(rarelyTypicalUserJson.publicKey.publicKeyPem);
    const result = await verifySignature(new Request("https://fedi-test.mooo.com/users/rarely-typical/inbox", {
        method: "POST", 
        headers: new Headers(requestJson.headers as [string, string][]), 
        body: JSON.stringify(requestJson.body)
    }), key);
    assert(!result);
});