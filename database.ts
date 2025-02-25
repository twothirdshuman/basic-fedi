import { ulid } from "jsr:@std/ulid";
import { DB_PATH } from "./config.ts";
import * as SQLITE from "node:sqlite";
import { Err, Ok, Result } from "./helpers.ts";

const db = new SQLITE.DatabaseSync(DB_PATH);
await db.exec(`
    PRAGMA journal_mode=WAL;
`);

await db.exec(`CREATE TABLE IF NOT EXISTS users (
    acct TEXT NOT NULL UNIQUE PRIMARY KEY,
    url TEXT NOT NULL
);`);

await db.exec(`CREATE TABLE IF NOT EXISTS posts (
    id TEXT NOT NULL PRIMARY KEY,
    author TEXT NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author) REFERENCES users(acct)
);`);

await db.exec(`CREATE TABLE IF NOT EXISTS inbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    to TEXT NOT NULL,
    post_id TEXT NOT NULL,
    FOREIGN KEY(to) REFERENCES users(acct),
    FOREIGN KEY(post_id) REFERENCES posts(id)
);`);

export interface User {
    acct: string;
    url: URL;
}

export type InboxMessage = Note | Announce;

export interface Note {
    type: "Note";
    author: User;
    message: {
        content: string,
        published: string,
        cw: string | null,
        sensative: boolean,
    };
}

export interface Announce {
    type: "Announce";
    author: User;
    message: Note;
};

export function addToInbox(user: User, message: InboxMessage): Promise<Result<undefined, undefined>> {
    try {
        db.prepare(`INSERT OR IGNORE INTO users (acct, url) VALUES (?, ?);`).run(message.author.acct, message.author.url.toString());
        const postUlid = ulid();
        const result = db.prepare(`INSERT INTO posts (id, author, data) VALUES (?, ?, ?);`).run(postUlid, message.author.acct, JSON.stringify(message));
        console.log(result.lastInsertRowid)
        db.prepare(`INSERT INTO inbox (to, post_id) VALUES (?, ?)`).run(user.acct, postUlid);
        return Promise.resolve(Ok(undefined));
    } catch (e) {
        console.log(e);
        return Promise.resolve(Err(undefined));
    }
}

export function getNotes(user: User): Promise<unknown[]> {
    const result = db.prepare(`
        SELECT * 
        FROM posts 
        WHERE id IN (
            SELECT post_id
            FROM inbox
            WHERE to = ?
        )
        ORDER BY created_at DESC;
    `).all(user.acct);

    return Promise.resolve(result);
}