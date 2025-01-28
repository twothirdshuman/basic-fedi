type SupportedObjectTypes = "Delete" | "Accept" | "Create" | "Note";

interface Object {
    "@context": string | string[];
    type: SupportedObjectTypes;
    id: URL;
};

interface Note extends Object {
    content: string;
};

interface Activity extends Object {

};

interface CreateActivity extends Activity {
    actor: URL;
    published: Date;
    to: URL[];
    cc: URL[];
    object: Object;
};

