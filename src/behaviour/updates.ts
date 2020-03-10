import { BookServer } from "../model/book"
import { getBookId } from "../model/identity"
import * as network from "../network/discovery"
import * as geo from "../model/geometry"
import { deepCopy } from "../utils"
import * as cl from "../commandline/commandline"
import { print } from "../commandline/print"

// updates happen with Things and Planes

export const UPDATE = {
    HOST:   "hostPlane",
    VISITS: "visits",
}

export interface Update {
    update: string;
    actorId: string;
    id: string;
}
export interface UpdateHostPlane extends Update {
    hostPlaneId: string;
}
export interface UpdateVisits extends Update {
    planeId: string;
    position: geo.Position;
}
// --- dispatcher ---
export async function update(B: BookServer, update: Update) {
    const targetBookId = getBookId(update.id);
    const message: network.MessageUpdate = {
        name: network.MESSAGE.UPDATE,
        update: update,
    }
    // print(update)
    return await B.sendMessage(targetBookId, message)
}

export const handlers = {

    hostPlane: async function(B: BookServer, update: UpdateHostPlane) {
        const thing = await B.things.load(update.id);
        thing.lostPlaneId = thing.hostPlaneId;
        thing.hostPlaneId = update.hostPlaneId;
        await B.things.save(thing);
    },

    visits: async function (B: BookServer, update: UpdateVisits) {
        const thing = await B.things.load(update.id);
        thing.visits[update.planeId] = deepCopy(update.position)
        await B.things.save(thing)
    },

}

