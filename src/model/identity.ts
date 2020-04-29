import * as crypto from "crypto";
import { BookServer } from "./book"
import { BookData, ThingData, PlaneData, PLANE, LIMBO_PORTAL_TEMPLATE } from "./interfaces"


export const BOOK_THING_ID    = "Book";
export const EQUIPMENT_PREFIX = "Equipment-of-";

export function getEquipmentId(bookId: string, thingId: string) {
    return [bookId, BOOK_THING_ID, EQUIPMENT_PREFIX+thingId].join(".");
}
export function isEquipmentPlaneId(planeId: string) {
    return getEquipmentOwnerId(planeId) !== undefined;
}
export function getEquipmentOwnerId(planeId: string) {
    const planeName = extractPlaneName(planeId)
    if (planeName.indexOf(EQUIPMENT_PREFIX) == 0) {
        return planeName.substr(EQUIPMENT_PREFIX.length);
    } else {
        return undefined;
    }
}

export function getBookThingId(bookId: string) {
    return `${bookId}.${BOOK_THING_ID}`
}

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
export function extractThingId(id: string) {
    const parts = id.split(".");
    return parts[1];

}
export function isThingId(id: string) {
    if (id === undefined) return false;
    return id.split(".").length < 3;
}
export function isLimbo(planeId: string) {
    const name = extractPlaneName(planeId);
    return (name == PLANE.LIMBO);
}
export function extractPlaneName(planeId: string) {
    const parts = planeId.split(".");
    return parts.slice(2).join("."); 
}
export function isInBook(id: string, bookId: string) {
    return getBookId(id) == bookId;
}
export function stripBookId(id: string) {
    if (id.indexOf(".") < 0) return id;
    return id.substr(getBookId(id).length+1);
}
export function getLimboPortalId(id: string) {
    const thingId = getThingId(id);
    const limboId = thingId+LIMBO_PORTAL_TEMPLATE;
    return limboId;
}
export function isLimboPortalId(id: string) {
    return (id.indexOf(LIMBO_PORTAL_TEMPLATE) > 0) && (id.indexOf(LIMBO_PORTAL_TEMPLATE) == id.length - LIMBO_PORTAL_TEMPLATE.length);
}
export function getLimboHost(limboPortalId: string) {
    return limboPortalId.substr(0, limboPortalId.indexOf(LIMBO_PORTAL_TEMPLATE));
}


export function createBookId() {
    return crypto.randomBytes(32).toString('hex')
}
export async function createThingId(B: BookServer, id?: string) {
    const bookId = B.data.id;
    id = stripBookId(id) || createBookId(); // same rule.
    id = `${bookId}.${id}`;
    let _id = id;
    let counter = 1;
    while (true) {
        const existing = await B.things.load(_id);
        if (!existing) break;
        counter++;
        _id = id + `-${counter}`;
    }
    return _id;
}
export function createPlaneId(name:string, thingId:string) {
    return `${thingId}.${name}`;
}

export function switchPlaneId(planeId: string, toThingId: string) {
    const parts = planeId.split(".");
    return createPlaneId(extractPlaneName(planeId), toThingId);
}
