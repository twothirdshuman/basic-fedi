type SupportedObjectTypes = "Delete" | "Accept" | "Create" | "Note" | "Collection";

interface Object {
    "@context": string | string[];
    type: SupportedObjectTypes;
    id: URL;
};

interface Note extends Object {
    type: "Note";
    summary: null | string; // assumed
    inReplyTo: null | URL; // assumed
    published: Date;
    url: URL;
    attributedTo: URL;
    to: URL[];
    cc: URL[];
    sensative: boolean;
    atomUri: URL;
    inReplyToAtomUri: null | URL; // assumed
    conversation: string;
    content: string;
    contentMap: Map<string, string>;
    attachment: null[]; // no clue array type
    tag: string[]; // no clue type assumed string
    replies: Collection;
    likes: Collection;
    shares: Collection;
};
    
interface Collection extends Object {
    type: "Collection";
    totalItems: number;
    first?: unknown; // no fucking clue some object i think
}

interface Activity extends Object {

};

interface CreateActivity<ContainedObject extends Object> extends Activity {
    type: "Create";
    actor: URL;
    published: Date;
    to: URL[];
    cc: URL[];
    object: ContainedObject;
};

