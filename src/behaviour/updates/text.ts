import { BookServer } from "../../model/book"
import * as updates from "../updates"
import * as model from "../../model/interfaces"
import * as cl from "../../commandline/commandline"
import { animate } from "../../anima/animate"
import * as utils from "../../utils"

const INSERT = "insert"
const DELETE = "delete"

export async function text(B: BookServer, update: updates.UpdateText) {
    let plane = B.planes.loadLocal(update.planeId);
    const owner = B.things.loadLocal(plane.ownerId);
    if (!plane) return;
    if (update.anchor) {
        plane.textAnchor = update.anchor;
    }
    let newText = update.text
    let originalUpdateText = ""+update.text
    // partial updates
    if (update.line!== undefined || update.lineAnchor !== undefined) {
        newText = plane.text
        let lines = newText.split("\n")
        let lineNo = update.line
        // get anchor
        if (update.lineAnchor) {
            let lineAnchor = utils.findAnchor(plane.text, update.lineAnchor);
            if (!lineAnchor) {
                lineAnchor = { value: "", index: lines.length }
            }
            lineNo = lineAnchor.index;
            update.text = utils.ANCHOR + update.lineAnchor + " " +update.text
        }
        if (update.special == DELETE) {
            lines.splice(lineNo, 1);
        } else {
            if (lines.length >= lineNo) {
                for (let i=lines.length; i<=lineNo; i++) {
                    lines.push("\n")
                }
            }
            if (update.special == INSERT) {
                lines.splice(lineNo, 0, originalUpdateText)
            } else {
                lines[lineNo] = update.text
            }
        }
        newText = lines.join("\n")
    }
    // --
    if (plane.text == newText) return;
    plane.text = newText;
    await B.planes.save(plane)
    // terminate existing animas and create new ones
    // only if the text was replaced completely.
    // Partial updates (update_line) don't reanimate.
    if (update.line === undefined && update.lineAnchor === undefined) {
        const animaControllers = B.getControllers(owner.id, true);
        for (let c of animaControllers) {
            c.anima.terminate()
        }
        animate(B, owner);
    }
}

export async function kneeled(B: BookServer, update: updates.UpdateKneeled) {
    const thing = await B.things.load(update.id);
    if (!thing) return;
    thing.isKneeled = update.isKneeled;
    await B.things.save(thing)
}

