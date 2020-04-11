import * as crypto from "crypto";
import { BookServer } from "./book"
import { BookData, ThingData, PlaneData } from "./interfaces"

export function getBookId(id: string) {
    return id.split(".")[0]
}
export function isBookId(id: string) {
    return id.indexOf(".") < 0;
}
export function getThingId(id: string) {
    const parts = id.split(".");
    return `${parts[0]}.${parts[1]}`;
}
export function isThingId(id: string) {
    return id.split(".").length < 3;
}

export function isInBook(id: string, bookId: string) {
    return getBookId(id) == bookId;
}
export function stripBookId(id: string) {
    return id.substr(getBookId(id).length+1);
}


export function createBookId() {
    return crypto.randomBytes(32).toString('hex')
}
export async function createThingId(B: BookServer, id?: string) {
    const bookId = B.data.id;
    id = id || createBookId(); // same rule.
    let counter = 0;
    while (true) {
        counter++;
        id = `${bookId}.${id}`+((counter < 2)?``:`-${counter}`);
        const existing = await B.things.load(id);
        if (!existing) break;
    }
    return id;
}
export function createPlaneId(name:string, thingId?:string) {
    return `${thingId}.${name}`;
}
