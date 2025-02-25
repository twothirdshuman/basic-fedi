import { assert } from "jsr:@std/assert/assert";
import { readCreateActivity, readNote, readObject } from "../activitypub/jsonToTypes.ts";
export default function test (){
    Deno.test("read note creation activity", () => {
        const str = '{"@context":["https://www.w3.org/ns/activitystreams",{"ostatus":"http://ostatus.org#","atomUri":"ostatus:atomUri","inReplyToAtomUri":"ostatus:inReplyToAtomUri","conversation":"ostatus:conversation","sensitive":"as:sensitive","toot":"http://joinmastodon.org/ns#","votersCount":"toot:votersCount","litepub":"http://litepub.social/ns#","directMessage":"litepub:directMessage"}],"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/activity","type":"Create","actor":"https://tech.lgbt/users/rarely_typical","published":"2025-01-28T19:05:17Z","to":["https://www.w3.org/ns/activitystreams#Public"],"cc":["https://tech.lgbt/users/rarely_typical/followers"],"object":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760","type":"Note","summary":null,"inReplyTo":null,"published":"2025-01-28T19:05:17Z","url":"https://tech.lgbt/@rarely_typical/113907539468094760","attributedTo":"https://tech.lgbt/users/rarely_typical","to":["https://www.w3.org/ns/activitystreams#Public"],"cc":["https://tech.lgbt/users/rarely_typical/followers"],"sensitive":false,"atomUri":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760","inReplyToAtomUri":null,"conversation":"tag:tech.lgbt,2025-01-28:objectId=202591980:objectType=Conversation","content":"<p>Test post</p>","contentMap":{"en":"<p>Test post</p>"},"attachment":[],"tag":[],"replies":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies","type":"Collection","first":{"type":"CollectionPage","next":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies?only_other_accounts=true&page=true","partOf":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies","items":[]}},"likes":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/likes","type":"Collection","totalItems":0},"shares":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/shares","type":"Collection","totalItems":0}}}';
        const result = readCreateActivity(str, readNote);
        assert(result !== undefined);
    });
    Deno.test("read note creation as object", () => {
        const str = '{"@context":["https://www.w3.org/ns/activitystreams",{"ostatus":"http://ostatus.org#","atomUri":"ostatus:atomUri","inReplyToAtomUri":"ostatus:inReplyToAtomUri","conversation":"ostatus:conversation","sensitive":"as:sensitive","toot":"http://joinmastodon.org/ns#","votersCount":"toot:votersCount","litepub":"http://litepub.social/ns#","directMessage":"litepub:directMessage"}],"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/activity","type":"Create","actor":"https://tech.lgbt/users/rarely_typical","published":"2025-01-28T19:05:17Z","to":["https://www.w3.org/ns/activitystreams#Public"],"cc":["https://tech.lgbt/users/rarely_typical/followers"],"object":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760","type":"Note","summary":null,"inReplyTo":null,"published":"2025-01-28T19:05:17Z","url":"https://tech.lgbt/@rarely_typical/113907539468094760","attributedTo":"https://tech.lgbt/users/rarely_typical","to":["https://www.w3.org/ns/activitystreams#Public"],"cc":["https://tech.lgbt/users/rarely_typical/followers"],"sensitive":false,"atomUri":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760","inReplyToAtomUri":null,"conversation":"tag:tech.lgbt,2025-01-28:objectId=202591980:objectType=Conversation","content":"<p>Test post</p>","contentMap":{"en":"<p>Test post</p>"},"attachment":[],"tag":[],"replies":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies","type":"Collection","first":{"type":"CollectionPage","next":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies?only_other_accounts=true&page=true","partOf":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies","items":[]}},"likes":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/likes","type":"Collection","totalItems":0},"shares":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/shares","type":"Collection","totalItems":0}}}';
        const result = readObject(str);
        assert(result !== undefined);
    });
    
    Deno.bench({
        name:"AAAAAAA",
        fn() {
            const str = '{"@context":["https://www.w3.org/ns/activitystreams",{"ostatus":"http://ostatus.org#","atomUri":"ostatus:atomUri","inReplyToAtomUri":"ostatus:inReplyToAtomUri","conversation":"ostatus:conversation","sensitive":"as:sensitive","toot":"http://joinmastodon.org/ns#","votersCount":"toot:votersCount","litepub":"http://litepub.social/ns#","directMessage":"litepub:directMessage"}],"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/activity","type":"Create","actor":"https://tech.lgbt/users/rarely_typical","published":"2025-01-28T19:05:17Z","to":["https://www.w3.org/ns/activitystreams#Public"],"cc":["https://tech.lgbt/users/rarely_typical/followers"],"object":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760","type":"Note","summary":null,"inReplyTo":null,"published":"2025-01-28T19:05:17Z","url":"https://tech.lgbt/@rarely_typical/113907539468094760","attributedTo":"https://tech.lgbt/users/rarely_typical","to":["https://www.w3.org/ns/activitystreams#Public"],"cc":["https://tech.lgbt/users/rarely_typical/followers"],"sensitive":false,"atomUri":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760","inReplyToAtomUri":null,"conversation":"tag:tech.lgbt,2025-01-28:objectId=202591980:objectType=Conversation","content":"<p>Test post</p>","contentMap":{"en":"<p>Test post</p>"},"attachment":[],"tag":[],"replies":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies","type":"Collection","first":{"type":"CollectionPage","next":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies?only_other_accounts=true&page=true","partOf":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/replies","items":[]}},"likes":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/likes","type":"Collection","totalItems":0},"shares":{"id":"https://tech.lgbt/users/rarely_typical/statuses/113907539468094760/shares","type":"Collection","totalItems":0}}}';
            const result = readCreateActivity(str, readNote);
            assert(result !== undefined);
        }
    });
};