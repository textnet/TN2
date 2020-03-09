/**
 * Generalised object storage based on an abstracted key-value storage
 */
import { Storage, createStorage } from "./abstraction"
import { BookServer } from "../model/book"
import { getBookId } from "../model/identity"
import * as cl from "../commandline/commandline"

/**
 * Repository of objects with interface <T>.
 * Each object has the "id" field which is used internally as `key`.
 */
export class Repository<T> {
    storage: Storage;
    server:  BookServer;
    cache: Record<string, T>;
    prefix: string;
    bookId: string;
    isFree: boolean;

    constructor(prefix: string, bookId: string, server?: BookServer) {
        this.prefix = prefix;
        this.bookId = bookId || "";
        this.storage = createStorage(this.bookId+"."+this.prefix);
        this.isFree = false;
        this.server = server;
    }
    free() { 
        this.storage.free() 
        this.isFree = true;
    }

    isLocal(id: string) {
        if (!this.server) return true;
        return getBookId(id) == this.bookId;
    }

    async load(id: string)   { 
        if (!this.isLocal(id)) {
            cl.verboseLog(`REMOTE LOAD(${this.bookId}.${this.prefix})->${id}`)
            return await this.server.loadRemote(this.prefix, id) as T;
        } else {
            return this.storage.get(id) as T     
        }
    }
    async save(value: T) { 
        return this.storage.set(value["id"], value) 
    }
    async remove(id: string) { 
        return this.storage.remove(id) 
    }
    async all() { 
        return this.storage.all() as Record<string, T> 
    }
    async clear() {
        return this.storage.clear();
    }
}

