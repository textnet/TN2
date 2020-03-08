import * as crypto from "crypto";

export function getBookId(id: string) {
    return id.split(".")[0]
}
export function isBookId(id: string) {
    return id.indexOf(".") < 0;
}

export function createBookId() {
    return crypto.randomBytes(32).toString('hex')
}
export function createThingId(bookId: string, id?: string) {
    id = id || createBookId(); // same rule.
    return `${bookId}.${id}`;
}
export function createPlaneId(name:string, thingId?:string) {
    return `${thingId}.${name}`;
}
