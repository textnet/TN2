import { BookServer } from "../../model/book"
import * as updates from "../updates"
import * as model from "../../model/interfaces"
import * as cl from "../../commandline/commandline"
import { animate } from "../../anima/animate"


export async function text(B: BookServer, update: updates.UpdateText) {
    const plane = await B.planes.load(update.planeId);
    const owner = await B.things.load(plane.ownerId);
    if (!plane) return;
    if (update.anchor) {
        plane.textAnchor = update.anchor;
    }
    if (plane.text == update.text) return;
    // update database
    plane.text = update.text;
    await B.planes.save(plane)
    // terminate existing animas and create new ones
    const animaControllers = B.getControllers(owner.id, true);
    for (let c of animaControllers) {
        c.anima.terminate()
    }
    animate(B, owner);
}

export async function kneeled(B: BookServer, update: updates.UpdateKneeled) {
    const thing = await B.things.load(update.id);
    if (!thing) return;
    thing.isKneeled = update.isKneeled;
    await B.things.save(thing)
}

