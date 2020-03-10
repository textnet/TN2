import * as crypto from "crypto";
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
