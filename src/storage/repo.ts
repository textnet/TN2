/**
 * Generalised object storage based on an abstracted key-value storage
 */
import { Storage, createStorage } from "./abstraction"
import { BookServer } from "../model/book"
import { getBookId } from "../model/identity"
import * as cl from "../commandline/commandline"


const TTL = 0; // = np cache
/**
 * Repository of objects with interface <T>.
 * Each object has the "id" field which is used internally as `key`.
 */
export class Repository<T> {
    storage: Storage;
    server:  BookServer;
    prefix: string;
    bookId: string;
    isFree: boolean;
    cache: Cache<T>;

    constructor(prefix: string, bookId: string, server?: BookServer) {
        this.prefix = prefix;
        this.bookId = bookId || "";
        this.storage = createStorage(this.bookId+"."+this.prefix);
        this.isFree = false;
        this.server = server;
        this.cache = new Cache<T>(prefix);
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
            const that = this;
            // cl.verboseLog(`REMOTE LOAD(${this.bookId}.${this.prefix})->${id}`)
            return await this.cache.get(id, (id)=>{ 
                // cl.verboseLog(`REMOTE LOAD(${that.bookId}.${that.prefix})->${id}`)
                return that.server.loadRemote(that.prefix, id)
            })
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



export class Cache<T> {
    prefix: string;
    ttl: number;
    _cache: Record<string, {data: T, timestamp: number}>;
    constructor(prefix:string, ttl?: number) {
        this.ttl = ttl || TTL; 
        this.prefix = prefix;
        this._cache = {}
    }
    async get(id: string, getter, force?:boolean) {
        if ((this.ttl == 0) || force || !this._cache[id] || (this._cache[id].timestamp+this.ttl < Date.now())) {
            await this.set(id, (await getter(id) as T));
        }
        return this._cache[id].data;
    }
    async set(id: string, value: T) {
        this._cache[id] = {
            data: value,
            timestamp: Date.now()
        }
    }
}