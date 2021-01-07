/**
 * Abstraction layer for a persistent storage.
 */
import * as Database from "better-sqlite3"

/**
 * Simple key-value storage, allows to get/set/remove/get-all.
 * Current implementation is SQLite3.
 */
export class Storage {
    private db;
    private kind: string;
    private s;
    private statements: Record<string, Database.Statement>;
    constructor(kind: string) {
        this.kind = kind;
        this.db = new Database("./_storage/"+kind+".db", {});
    }

    /**
     * Init storage: create database if it was not there, prepare queries.
     */
    init() {
        this.statements = {};
        this.statements["create"] = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS items (
                id TEXT NOT NULL UNIQUE,
                data TEXT DEFAULT ''
            )`)
        this.statements["create"].run();
        this.statements["get"] = this.db.prepare(`
            SELECT id, data FROM items WHERE id=?`);
        this.statements["set"] = this.db.prepare(`
            REPLACE INTO items (id, data) VALUES (?,?)`);
        this.statements["remove"] = this.db.prepare(`
            DELETE FROM items WHERE id=?`);
        this.statements["clear"] = this.db.prepare(`
            DELETE FROM items`);
        this.statements["all"] = this.db.prepare(`
            SELECT id, data FROM items`);
    }

    /**
     * Store `value` under `key`.
     * @param {string} key
     * @param {any}    value
     */
    set( key: string, value: any) {
        // console.log(`Write => ${this.kind} [${key}].`);
        const data = JSON.stringify(value);
        const result = this.statements["set"].run(key, data)
        return result;
    }

    /**
     * Get value under `key`.
     * @param   {string} key
     * @returns {any}    value
     */
    get( key: string ) {
        // console.log(`Load  <= ${this.kind} [${key}].`);
        const raw = this.statements["get"].get(key)
        if (raw == undefined) return raw;
        const result = JSON.parse(raw.data);
        return result;
    }


    /**
     * Remove `key` from the storage
     * @param   {string} key
     */    
    remove( key: string ) {
        return this.statements["remove"].run(key);
    }

    /**
     * Clear storage, start from scratch.
     */    
    clear() {
        return this.statements["clear"].run();
    }

    /**
     * Get all key-value pairs from the storage.
     * @return {Record<string, any>}
     */    
    all() {
        const raw = this.statements["all"].all();
        let result = {};
        for (let o of raw) {
            result[o.id] = JSON.parse(o.data);
        }
        return result;
    }

    /**
     * Shutdown the storage engine.
     */    
    free() {
        this.db.close();
    }
}
