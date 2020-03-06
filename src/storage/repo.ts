/**
 * Generalised object storage based on an abstracted key-value storage
 */
import { Storage, createStorage } from "./abstraction"
import { getBookId } from "../model/book"

/**
 * Repository of objects with interface <T>.
 * Each object has the "id" field which is used internally as `key`.
 */
export class Repository<T> {
    storage: Storage;
    cache: Record<string, T>;
    prefix: string;
    bookId: string;
    isFree: boolean;

    constructor(prefix: string, bookId?: string) {
        this.prefix = prefix;
        this.bookId = bookId || "";
        this.storage = createStorage(this.bookId+"."+this.prefix);
        this.isFree = false;
    }
    free() { 
        this.storage.free() 
        this.isFree = true;
    }

    isLocal(id: string) {
        return this.bookId ? (getBookId(id) == this.bookId) : true;
    }

    async load(id: string)   { 
        if (!this.isLocal(id)) {
            console.log(`REMOTE LOAD(${this.bookId}.${this.prefix})->`, id)
            // const data = await remote.load(this.persistence, this.prefix, id);
            // await this.save(data);
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

