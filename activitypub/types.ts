export type SupportedObjectTypes = "Delete" | "Accept" | "Create" | "Note" | "Collection";
export type AtContextContext = URL | Map<string, URL>; 

export interface Object {
    "@context": AtContextContext | AtContextContext[];
    type: SupportedObjectTypes;
    id: URL;
};

export interface Note extends Object {
    type: "Note";
    summary: null | string; // assumed
    inReplyTo: null | URL; // assumed
    published: Date;
    url: URL;
    attributedTo: URL;
    to: URL[];
    cc: URL[];
    sensitive: boolean;
    atomUri: URL;
    inReplyToAtomUri: null | URL; // assumed
    conversation: string;
    content: string;
    contentMap: Map<string, string>;
    attachment: never[]; // no clue array type, prolly list of URLs
    tag: string[]; // no clue type assumed string
    replies: Collection;
    likes: Collection;
    shares: Collection;
};
    
export interface Collection extends Object {
    type: "Collection";
    totalItems: number;
    first?: unknown; // no fucking clue some object i think
}

export interface Activity extends Object {

};

export interface CreateActivity<ContainedObject extends Object> extends Activity {
    type: "Create";
    actor: URL;
    published: Date;
    to: URL[];
    cc: URL[];
    object: ContainedObject;
};

