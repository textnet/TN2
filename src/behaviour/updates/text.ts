import { BookServer } from "../../model/book"
import * as updates from "../updates"
import * as model from "../../model/interfaces"
import * as cl from "../../commandline/commandline"


export async function text(B: BookServer, update: updates.UpdateText) {
    const plane = await B.planes.load(update.planeId);
    if (!plane) return;
    if (update.anchor) {
        plane.textAnchor = update.anchor;
    }
    plane.text = update.text;
    await B.planes.save(plane)
}

export async function kneeled(B: BookServer, update: updates.UpdateKneeled) {
    const thing = await B.things.load(update.id);
    if (!thing) return;
    thing.isKneeled = update.isKneeled;
    await B.things.save(thing)
}

