import * as sqlite from "./sqlite"

export class Storage extends sqlite.Storage {};

export function createStorage(storageName: string) {
    const storage = new sqlite.Storage(storageName);
    storage.init();
    return storage;
}

