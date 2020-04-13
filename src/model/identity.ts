import * as crypto from "crypto";
import { BookServer } from "./book"
import { BookData, ThingData, PlaneData, PLANE, LIMBO_PORTAL_TEMPLATE } from "./interfaces"


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
export function isLimbo(planeId: string) {
    const name = extractPlaneName(planeId);
    return (name == PLANE.LIMBO);
}
export function extractPlaneName(planeId: string) {
    const parts = planeId.split(".");
    return parts[ parts.length-1 ];
}
export function isInBook(id: string, bookId: string) {
    return getBookId(id) == bookId;
}
export function stripBookId(id: string) {
    return id.substr(getBookId(id).length+1);
}
export function getLimboPortalId(id: string) {
    const thingId = getThingId(id);
    const limboId = thingId+LIMBO_PORTAL_TEMPLATE;
    return limboId;
}
export function isLimboPortalId(id: string) {
    return (id.indexOf(LIMBO_PORTAL_TEMPLATE) == id.length - LIMBO_PORTAL_TEMPLATE.length);
}
export function getLimboHost(limboPortalId: string) {
    return limboPortalId.substr(0, limboPortalId.indexOf(LIMBO_PORTAL_TEMPLATE));
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
export function createPlaneId(name:string, thingId:string) {
    return `${thingId}.${name}`;
}

export function switchPlaneId(planeId: string, toThingId: string) {
    const parts = planeId.split(".");
    return createPlaneId(extractPlaneName(planeId), toThingId);
}
